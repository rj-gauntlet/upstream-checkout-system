from django.urls import path

from . import views

app_name = "orders"

urlpatterns = [
    path("checkout/", views.CheckoutView.as_view(), name="checkout"),
    path("orders/", views.OrderListView.as_view(), name="order-list"),
    path("orders/lookup/", views.GuestOrderLookupView.as_view(), name="order-lookup"),
    path(
        "orders/<str:order_number>/",
        views.OrderDetailView.as_view(),
        name="order-detail",
    ),
]
