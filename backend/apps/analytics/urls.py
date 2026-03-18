from django.urls import path

from . import views

app_name = "analytics"

urlpatterns = [
    path("analytics/events/", views.RecordEventView.as_view(), name="record-event"),
]
