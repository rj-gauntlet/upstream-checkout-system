from datetime import timedelta

from django.db.models import Count, Sum, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Category, Product
from apps.orders.models import Order, OrderItem

from .models import AnalyticsEvent


class DashboardSummaryView(APIView):
    """Return high-level KPIs for the analytics dashboard."""

    permission_classes = [AllowAny]

    def get(self, request):
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(
            revenue=Sum("total")
        )["revenue"] or 0
        total_customers = (
            Order.objects.values("email").distinct().count()
        )
        total_products = Product.objects.filter(is_active=True).count()

        # Cart abandonment: sessions that had add_to_cart but never purchase_complete
        sessions_with_add = set(
            AnalyticsEvent.objects.filter(event_type="add_to_cart")
            .values_list("session_id", flat=True)
            .distinct()
        )
        sessions_with_purchase = set(
            AnalyticsEvent.objects.filter(event_type="purchase_complete")
            .values_list("session_id", flat=True)
            .distinct()
        )
        abandoned = sessions_with_add - sessions_with_purchase
        cart_abandonment_rate = (
            (len(abandoned) / len(sessions_with_add) * 100)
            if sessions_with_add
            else 0
        )

        # Conversion rate: sessions with purchase / all unique sessions
        total_sessions = (
            AnalyticsEvent.objects.values("session_id").distinct().count()
        )
        conversion_rate = (
            (len(sessions_with_purchase) / total_sessions * 100)
            if total_sessions
            else 0
        )

        return Response(
            {
                "total_orders": total_orders,
                "total_revenue": float(total_revenue),
                "total_customers": total_customers,
                "total_products": total_products,
                "cart_abandonment_rate": round(cart_abandonment_rate, 2),
                "conversion_rate": round(conversion_rate, 2),
            }
        )


class RevenueByCategoryView(APIView):
    """Return revenue grouped by product category."""

    permission_classes = [AllowAny]

    def get(self, request):
        data = (
            OrderItem.objects.filter(product__isnull=False)
            .values(category_name=F("product__category__name"))
            .annotate(revenue=Sum("line_total"))
            .order_by("-revenue")
        )
        return Response(
            [
                {
                    "category": row["category_name"],
                    "revenue": float(row["revenue"]),
                }
                for row in data
            ]
        )


class PopularProductsView(APIView):
    """Return the top 10 products by units sold."""

    permission_classes = [AllowAny]

    def get(self, request):
        data = (
            OrderItem.objects.values(
                name=F("product_name"),
            )
            .annotate(units_sold=Sum("quantity"))
            .order_by("-units_sold")[:10]
        )
        return Response(
            [
                {
                    "product": row["name"],
                    "units_sold": row["units_sold"],
                }
                for row in data
            ]
        )


class RecentOrdersView(APIView):
    """Return the 10 most recent orders."""

    permission_classes = [AllowAny]

    def get(self, request):
        orders = Order.objects.order_by("-created_at")[:10]
        return Response(
            [
                {
                    "order_number": o.order_number,
                    "email": o.email,
                    "total": float(o.total),
                    "status": o.status,
                    "created_at": o.created_at.isoformat(),
                }
                for o in orders
            ]
        )


class EventsOverTimeView(APIView):
    """Return event counts grouped by date for the last 30 days."""

    permission_classes = [AllowAny]

    def get(self, request):
        since = timezone.now() - timedelta(days=30)
        data = (
            AnalyticsEvent.objects.filter(created_at__gte=since)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )
        return Response(
            [
                {
                    "date": row["date"].isoformat(),
                    "count": row["count"],
                }
                for row in data
            ]
        )
