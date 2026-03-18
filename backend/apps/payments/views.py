from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer

from .services import (
    capture_paypal_order,
    create_paypal_order,
    create_stripe_payment_intent,
    handle_stripe_webhook,
)


class StripeCreateIntentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_number = request.data.get("order_number")
        if not order_number:
            return Response(
                {"error": "order_number is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            intent = create_stripe_payment_intent(order)
            return Response(
                {
                    "client_secret": intent.client_secret,
                    "payment_intent_id": intent.id,
                }
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        try:
            handle_stripe_webhook(payload, sig_header)
            return Response({"status": "ok"})
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )


class PayPalCreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_number = request.data.get("order_number")
        if not order_number:
            return Response(
                {"error": "order_number is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            paypal_order_id = create_paypal_order(order)
            return Response({"paypal_order_id": paypal_order_id})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PayPalCaptureView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        paypal_order_id = request.data.get("paypal_order_id")

        if not paypal_order_id:
            return Response(
                {"error": "paypal_order_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = capture_paypal_order(paypal_order_id)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
