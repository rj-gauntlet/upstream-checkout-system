from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(ModelAdmin):
    list_display = ["user", "phone", "city", "state", "zip_code", "created_at"]
    search_fields = ["user__username", "user__email", "phone", "city", "state"]
    list_filter = ["state", "created_at"]
    readonly_fields = ["created_at", "updated_at"]
