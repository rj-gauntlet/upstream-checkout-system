import stripe
import requests
from django.conf import settings

from apps.orders.models import Order
from apps.orders.services import send_order_confirmation

# Configure Stripe
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", "")

# PayPal config
PAYPAL_CLIENT_ID = getattr(settings, "PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = getattr(settings, "PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE = getattr(settings, "PAYPAL_MODE", "sandbox")
PAYPAL_BASE_URL = (
    "https://api-m.sandbox.paypal.com"
    if PAYPAL_MODE == "sandbox"
    else "https://api-m.paypal.com"
)


def _get_paypal_access_token():
    """Get an OAuth2 access token from PayPal."""
    response = requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
        headers={"Accept": "application/json"},
    )
    response.raise_for_status()
    return response.json()["access_token"]


def create_stripe_payment_intent(order):
    """Create a Stripe PaymentIntent for the given order."""
    intent = stripe.PaymentIntent.create(
        amount=int(order.total * 100),
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
    """Handle incoming Stripe webhook events."""
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
    """Create a PayPal v2 Order and return the PayPal order ID."""
    access_token = _get_paypal_access_token()

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": order.order_number,
                "description": f"Upstream Literacy Order #{order.order_number}",
                "amount": {
                    "currency_code": "USD",
                    "value": str(order.total),
                    "breakdown": {
                        "item_total": {
                            "currency_code": "USD",
                            "value": str(order.subtotal),
                        },
                        "tax_total": {
                            "currency_code": "USD",
                            "value": str(order.tax),
                        },
                    },
                },
                "items": [
                    {
                        "name": item.product_name[:127],
                        "unit_amount": {
                            "currency_code": "USD",
                            "value": str(item.product_price),
                        },
                        "quantity": str(item.quantity),
                    }
                    for item in order.items.all()
                ],
            }
        ],
    }

    response = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders",
        json=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
    )
    response.raise_for_status()
    data = response.json()

    order.payment_id = data["id"]
    order.payment_status = "created"
    order.save(update_fields=["payment_id", "payment_status"])

    return data["id"]


def capture_paypal_order(paypal_order_id):
    """Capture a PayPal v2 Order after buyer approval."""
    access_token = _get_paypal_access_token()

    response = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders/{paypal_order_id}/capture",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
    )
    response.raise_for_status()
    data = response.json()

    if data["status"] == "COMPLETED":
        try:
            order = Order.objects.get(payment_id=paypal_order_id)
            order.status = Order.Status.PAID
            order.payment_status = "completed"
            order.save(update_fields=["status", "payment_status"])
            send_order_confirmation(order)
            return order
        except Order.DoesNotExist:
            raise Exception("Order not found for this PayPal order.")

    raise Exception(f"PayPal capture not completed. Status: {data['status']}")
