from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path(
        "payments/stripe/create-intent/",
        views.StripeCreateIntentView.as_view(),
        name="stripe-create-intent",
    ),
    path(
        "payments/stripe/webhook/",
        views.StripeWebhookView.as_view(),
        name="stripe-webhook",
    ),
    path(
        "payments/paypal/create-order/",
        views.PayPalCreateOrderView.as_view(),
        name="paypal-create-order",
    ),
    path(
        "payments/paypal/capture/",
        views.PayPalCaptureView.as_view(),
        name="paypal-capture",
    ),
]
