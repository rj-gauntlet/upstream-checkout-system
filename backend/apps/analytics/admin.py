from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import AnalyticsEvent


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(ModelAdmin):
    list_display = ["event_type", "user", "session_id", "product", "order", "created_at"]
    list_filter = ["event_type", "created_at"]
    search_fields = ["event_type", "session_id"]
    readonly_fields = [
        "event_type",
        "user",
        "session_id",
        "product",
        "order",
        "metadata",
        "created_at",
    ]
    date_hierarchy = "created_at"

    class Media:
        pass

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["subtitle"] = (
            "Dashboard API available at /api/v1/analytics/dashboard/ "
            "— endpoints: summary/, revenue-by-category/, popular-products/, "
            "recent-orders/, events-over-time/"
        )
        return super().changelist_view(request, extra_context=extra_context)
