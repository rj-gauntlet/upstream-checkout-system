from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.catalog.urls')),
    path('api/v1/', include('apps.cart.urls')),
    path('api/v1/', include('apps.orders.urls')),
    path('api/v1/', include('apps.payments.urls')),
    path('api/v1/', include('apps.analytics.urls')),
]

# Serve media files in both dev and production
# In production on Railway, WhiteNoise handles static but not media,
# so we serve media via Django's static helper
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
