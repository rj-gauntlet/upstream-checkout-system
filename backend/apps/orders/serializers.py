from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, source="line_total"
    )
    price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, source="product_price"
    )
    product_slug = serializers.CharField(source="product.slug", read_only=True, default="")

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_slug",
            "price",
            "quantity",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "email",
            "status",
            "shipping_first_name",
            "shipping_last_name",
            "shipping_address_line1",
            "shipping_address_line2",
            "shipping_city",
            "shipping_state",
            "shipping_zip_code",
            "payment_method",
            "payment_status",
            "subtotal",
            "tax",
            "total",
            "items",
            "created_at",
            "updated_at",
        ]


class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "email",
            "status",
            "total",
            "item_count",
            "created_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class CheckoutSerializer(serializers.Serializer):
    email = serializers.EmailField()
    shipping_first_name = serializers.CharField(max_length=100)
    shipping_last_name = serializers.CharField(max_length=100)
    shipping_address_line1 = serializers.CharField(max_length=255)
    shipping_address_line2 = serializers.CharField(
        max_length=255, required=False, allow_blank=True, default=""
    )
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=50)
    shipping_zip_code = serializers.CharField(max_length=20)
    payment_method = serializers.ChoiceField(choices=["stripe", "paypal"])
