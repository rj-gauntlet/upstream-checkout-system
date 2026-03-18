import stripe
import paypalrestsdk
from django.conf import settings

from apps.orders.models import Order
from apps.orders.services import send_order_confirmation

# Configure Stripe
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", "")

# Configure PayPal
paypalrestsdk.configure(
    {
        "mode": getattr(settings, "PAYPAL_MODE", "sandbox"),
        "client_id": getattr(settings, "PAYPAL_CLIENT_ID", ""),
        "client_secret": getattr(settings, "PAYPAL_CLIENT_SECRET", ""),
    }
)


def create_stripe_payment_intent(order):
    """Create a Stripe PaymentIntent for the given order.

    Returns the PaymentIntent object with client_secret for frontend confirmation.
    """
    intent = stripe.PaymentIntent.create(
        amount=int(order.total * 100),  # Stripe expects amount in cents
        currency="usd",
        metadata={
            "order_id": str(order.id),
            "order_number": order.order_number,
        },
    )

    order.payment_id = intent.id
    order.payment_status = "pending"
    order.save(update_fields=["payment_id", "payment_status"])

    return intent


def handle_stripe_webhook(payload, sig_header):
    """Handle incoming Stripe webhook events.

    Processes payment_intent.succeeded and payment_intent.payment_failed events.
    """
    webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")
    event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        try:
            order = Order.objects.get(payment_id=payment_intent["id"])
            order.status = Order.Status.PAID
            order.payment_status = "succeeded"
            order.save(update_fields=["status", "payment_status"])
            send_order_confirmation(order)
        except Order.DoesNotExist:
            pass

    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        try:
            order = Order.objects.get(payment_id=payment_intent["id"])
            order.payment_status = "failed"
            order.save(update_fields=["payment_status"])
        except Order.DoesNotExist:
            pass

    return event


def create_paypal_order(order):
    """Create a PayPal Payment for the given order.

    Returns the approval URL for redirecting the user to PayPal.
    """
    payment = paypalrestsdk.Payment(
        {
            "intent": "sale",
            "payer": {"payment_method": "paypal"},
            "redirect_urls": {
                "return_url": getattr(
                    settings, "PAYPAL_RETURN_URL", "http://localhost:3000/checkout/success"
                ),
                "cancel_url": getattr(
                    settings, "PAYPAL_CANCEL_URL", "http://localhost:3000/checkout/cancel"
                ),
            },
            "transactions": [
                {
                    "item_list": {
                        "items": [
                            {
                                "name": item.product_name,
                                "sku": str(item.id),
                                "price": str(item.product_price),
                                "currency": "USD",
                                "quantity": item.quantity,
                            }
                            for item in order.items.all()
                        ]
                    },
                    "amount": {
                        "total": str(order.total),
                        "currency": "USD",
                        "details": {
                            "subtotal": str(order.subtotal),
                            "tax": str(order.tax),
                        },
                    },
                    "description": f"Upstream Literacy Order #{order.order_number}",
                }
            ],
        }
    )

    if payment.create():
        order.payment_id = payment.id
        order.payment_status = "created"
        order.save(update_fields=["payment_id", "payment_status"])

        for link in payment.links:
            if link.rel == "approval_url":
                return link.href

    raise Exception(f"PayPal payment creation failed: {payment.error}")


def capture_paypal_payment(payment_id, payer_id):
    """Capture (execute) a PayPal payment after user approval.

    Updates the order status on successful capture.
    """
    payment = paypalrestsdk.Payment.find(payment_id)

    if payment.execute({"payer_id": payer_id}):
        try:
            order = Order.objects.get(payment_id=payment_id)
            order.status = Order.Status.PAID
            order.payment_status = "completed"
            order.save(update_fields=["status", "payment_status"])
            send_order_confirmation(order)
            return order
        except Order.DoesNotExist:
            raise Exception("Order not found for this payment.")
    else:
        raise Exception(f"PayPal payment capture failed: {payment.error}")
