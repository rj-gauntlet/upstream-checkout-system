from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "product",
        "product_name",
        "product_price",
        "quantity",
        "line_total",
    ]


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = [
        "order_number",
        "email",
        "status",
        "total",
        "payment_method",
        "created_at",
    ]
    list_filter = ["status", "payment_method", "created_at"]
    search_fields = ["order_number", "email", "shipping_last_name"]
    inlines = [OrderItemInline]
    readonly_fields = ["id", "order_number", "created_at", "updated_at"]
