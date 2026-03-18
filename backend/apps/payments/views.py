from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer

from .services import (
    capture_paypal_payment,
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
            approval_url = create_paypal_order(order)
            return Response({"approval_url": approval_url})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PayPalCaptureView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payment_id = request.data.get("payment_id")
        payer_id = request.data.get("payer_id")

        if not payment_id or not payer_id:
            return Response(
                {"error": "payment_id and payer_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = capture_paypal_payment(payment_id, payer_id)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
