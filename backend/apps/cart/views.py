import uuid

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product

from .models import Cart, CartItem
from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)


def get_or_create_cart(request):
    """Get or create a cart for the current request.

    Priority:
    1. Authenticated user's cart
    2. Cart from session cookie
    3. Create a new cart
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    session_key = request.COOKIES.get("cart_session")
    if session_key:
        try:
            return Cart.objects.get(session_key=session_key)
        except Cart.DoesNotExist:
            pass

    session_key = uuid.uuid4().hex[:40]
    cart = Cart.objects.create(session_key=session_key)
    return cart


def set_cart_cookie(response, cart):
    """Set the cart session cookie for guest users."""
    if cart.session_key:
        response.set_cookie(
            "cart_session",
            cart.session_key,
            max_age=30 * 24 * 60 * 60,  # 30 days
            httponly=True,
            samesite="Lax",
        )
    return response


class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        response = Response(serializer.data)
        return set_cart_cookie(response, cart)

    def delete(self, request):
        cart = get_or_create_cart(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if product.stock < quantity:
            return Response(
                {"error": f"Only {product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_or_create_cart(request)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock:
                return Response(
                    {"error": f"Only {product.stock} items available in stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.save()

        cart_serializer = CartSerializer(cart)
        response = Response(cart_serializer.data, status=status.HTTP_201_CREATED)
        return set_cart_cookie(response, cart)


class CartItemDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND
            )

        quantity = serializer.validated_data["quantity"]
        if quantity > cart_item.product.stock:
            return Response(
                {"error": f"Only {cart_item.product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = quantity
        cart_item.save()

        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)

    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)


class CartMergeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_key = request.COOKIES.get("cart_session")
        if not session_key:
            return Response(
                {"message": "No guest cart to merge."},
                status=status.HTTP_200_OK,
            )

        try:
            guest_cart = Cart.objects.get(session_key=session_key)
        except Cart.DoesNotExist:
            return Response(
                {"message": "No guest cart to merge."},
                status=status.HTTP_200_OK,
            )

        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        for guest_item in guest_cart.items.select_related("product").all():
            user_item, created = CartItem.objects.get_or_create(
                cart=user_cart,
                product=guest_item.product,
                defaults={"quantity": guest_item.quantity},
            )
            if not created:
                user_item.quantity += guest_item.quantity
                user_item.save()

        guest_cart.delete()

        cart_serializer = CartSerializer(user_cart)
        response = Response(cart_serializer.data)
        response.delete_cookie("cart_session")
        return response
