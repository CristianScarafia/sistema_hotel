from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import time
import os
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


@csrf_exempt
@require_http_methods(["GET", "HEAD"])
def health_check(request):
    """Endpoint de health check para Railway"""
    try:
        # Verificar que Django esté funcionando
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse(
            {
                "status": "healthy",
                "service": "hotel-backend",
                "message": "Service is running",
                "timestamp": time.time(),
                "environment": os.environ.get("DJANGO_SETTINGS_MODULE", "unknown"),
            },
            status=200
        )
    except Exception as e:
        return JsonResponse(
            {
                "status": "unhealthy",
                "service": "hotel-backend",
                "message": str(e),
                "timestamp": time.time(),
            },
            status=500
        )


@csrf_exempt
@require_http_methods(["GET", "HEAD"])
def simple_health_check(request):
    """Health check simple sin base de datos"""
    return JsonResponse(
        {
            "status": "ok",
            "service": "hotel-backend",
            "message": "Django is running",
            "timestamp": time.time(),
        },
        status=200
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("apps.reservas.urls")),
    path("api/", include("apps.reservas.api_urls")),
    # OpenAPI schema y UIs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("health/", health_check, name="health_check"),
    path("ping/", simple_health_check, name="simple_health_check"),
]
