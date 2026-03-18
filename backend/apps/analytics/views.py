from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AnalyticsEvent


class RecordEventView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        event_type = request.data.get("event_type")
        if not event_type:
            return Response(
                {"error": "event_type is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = AnalyticsEvent.objects.create(
            event_type=event_type,
            user=request.user if request.user.is_authenticated else None,
            session_id=request.data.get("session_id", ""),
            product_id=request.data.get("product_id"),
            order_id=request.data.get("order_id"),
            metadata=request.data.get("metadata", {}),
        )

        return Response(
            {
                "id": event.id,
                "event_type": event.event_type,
                "created_at": event.created_at,
            },
            status=status.HTTP_201_CREATED,
        )
