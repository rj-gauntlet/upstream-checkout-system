from decimal import Decimal

from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F

from .models import Order, OrderItem

TAX_RATE = Decimal("0.08")


class InsufficientStockError(Exception):
    """Raised when a product does not have enough stock to fulfill an order."""

    def __init__(self, product_name, requested, available):
        self.product_name = product_name
        self.requested = requested
        self.available = available
        super().__init__(
            f"Insufficient stock for '{product_name}': "
            f"requested {requested}, available {available}."
        )


def create_order_from_cart(cart, checkout_data):
    """Create an order from a cart and checkout data.

    Validates the cart is not empty, checks stock for every item,
    atomically decrements stock, creates the order, and clears the cart.
    """
    cart_items = cart.items.select_related("product").all()

    if not cart_items.exists():
        raise ValueError("Cannot checkout with an empty cart.")

    # Validate stock availability
    for item in cart_items:
        if item.product.stock < item.quantity:
            raise InsufficientStockError(
                product_name=item.product.name,
                requested=item.quantity,
                available=item.product.stock,
            )

    with transaction.atomic():
        # Calculate totals
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
        total = subtotal + tax

        # Create the order
        order = Order.objects.create(
            user=cart.user,
            email=checkout_data["email"],
            shipping_first_name=checkout_data["shipping_first_name"],
            shipping_last_name=checkout_data["shipping_last_name"],
            shipping_address_line1=checkout_data["shipping_address_line1"],
            shipping_address_line2=checkout_data.get("shipping_address_line2", ""),
            shipping_city=checkout_data["shipping_city"],
            shipping_state=checkout_data["shipping_state"],
            shipping_zip_code=checkout_data["shipping_zip_code"],
            payment_method=checkout_data["payment_method"],
            subtotal=subtotal,
            tax=tax,
            total=total,
        )

        # Create order items and decrement stock atomically
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
                line_total=item.product.price * item.quantity,
            )

            # Atomic stock decrement with guard
            updated = (
                type(item.product)
                .objects.filter(id=item.product.id, stock__gte=item.quantity)
                .update(stock=F("stock") - item.quantity)
            )
            if not updated:
                raise InsufficientStockError(
                    product_name=item.product.name,
                    requested=item.quantity,
                    available=item.product.stock,
                )

        # Clear the cart
        cart.items.all().delete()

    return order


def send_order_confirmation(order):
    """Send an order confirmation email using Django's console email backend."""
    subject = f"Upstream Literacy - Order Confirmation #{order.order_number}"
    message = (
        f"Thank you for your order!\n\n"
        f"Order Number: {order.order_number}\n"
        f"Total: ${order.total}\n\n"
        f"Items:\n"
    )
    for item in order.items.all():
        message += f"  - {item.quantity}x {item.product_name} @ ${item.product_price}\n"

    message += (
        f"\nSubtotal: ${order.subtotal}\n"
        f"Tax: ${order.tax}\n"
        f"Total: ${order.total}\n\n"
        f"Shipping to:\n"
        f"  {order.shipping_first_name} {order.shipping_last_name}\n"
        f"  {order.shipping_address_line1}\n"
    )
    if order.shipping_address_line2:
        message += f"  {order.shipping_address_line2}\n"
    message += (
        f"  {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}\n"
    )

    send_mail(
        subject=subject,
        message=message,
        from_email="orders@upstreamliteracy.com",
        recipient_list=[order.email],
        fail_silently=True,
    )


def restore_stock(order):
    """Restore stock for a cancelled order using F() expressions."""
    for item in order.items.select_related("product").all():
        if item.product:
            type(item.product).objects.filter(id=item.product.id).update(
                stock=F("stock") + item.quantity
            )
