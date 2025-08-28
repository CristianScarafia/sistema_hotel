from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
import time


def health_check(request):
    """Endpoint de health check para Railway"""
    return JsonResponse(
        {
            "status": "healthy",
            "service": "hotel-backend",
            "message": "Service is running",
            "timestamp": time.time(),
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("apps.reservas.urls")),
    path("api/", include("apps.reservas.api_urls")),
    path("health/", health_check, name="health_check"),
]
