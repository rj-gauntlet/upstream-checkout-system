from django.urls import path

from . import views
from .dashboard import (
    DashboardSummaryView,
    EventsOverTimeView,
    PopularProductsView,
    RecentOrdersView,
    RevenueByCategoryView,
)

app_name = "analytics"

urlpatterns = [
    path("analytics/events/", views.RecordEventView.as_view(), name="record-event"),
    # Dashboard API endpoints
    path(
        "analytics/dashboard/summary/",
        DashboardSummaryView.as_view(),
        name="dashboard-summary",
    ),
    path(
        "analytics/dashboard/revenue-by-category/",
        RevenueByCategoryView.as_view(),
        name="dashboard-revenue-by-category",
    ),
    path(
        "analytics/dashboard/popular-products/",
        PopularProductsView.as_view(),
        name="dashboard-popular-products",
    ),
    path(
        "analytics/dashboard/recent-orders/",
        RecentOrdersView.as_view(),
        name="dashboard-recent-orders",
    ),
    path(
        "analytics/dashboard/events-over-time/",
        EventsOverTimeView.as_view(),
        name="dashboard-events-over-time",
    ),
]
