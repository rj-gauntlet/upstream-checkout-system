from django.core.management import call_command
from django.db.models import Count
from django_filters import rest_framework as filters
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category__slug")

    class Meta:
        model = Product
        fields = ["category", "featured"]


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(product_count=Count("products"))
            .order_by("name")
        )


class CategoryDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Category.objects.filter(is_active=True).annotate(
            product_count=Count("products")
        )


class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    filterset_class = ProductFilter
    search_fields = ["name", "description", "sku"]
    ordering_fields = ["name", "price", "created_at"]

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )


class SeedDataView(APIView):
    """Temporary endpoint to seed the database. Remove after use."""

    permission_classes = [AllowAny]

    def post(self, request):
        call_command("seed_data")
        return Response(
            {
                "status": "success",
                "categories": Category.objects.count(),
                "products": Product.objects.count(),
            }
        )


class FeaturedProductsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True, featured=True)
            .select_related("category")
            .prefetch_related("images")[:8]
        )
