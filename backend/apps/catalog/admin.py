from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ["name", "slug", "parent", "is_active", "created_at"]
    list_filter = ["is_active", "parent"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = [
        "name",
        "sku",
        "category",
        "price",
        "stock",
        "is_active",
        "featured",
        "created_at",
    ]
    list_filter = ["is_active", "featured", "category", "created_at"]
    search_fields = ["name", "description", "sku"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
