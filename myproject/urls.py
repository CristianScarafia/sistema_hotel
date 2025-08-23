from django.contrib import admin
from django.urls import include, path
from reservas.views import home
from reservas import views
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.auth.views import LoginView, LogoutView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# from rest_framework.documentation import include_docs_urls


@csrf_exempt
def health_check(request):
    """Health check simple que no depende de la base de datos"""
    return JsonResponse(
        {
            "status": "healthy",
            "service": "hotel-backend",
            "message": "Django is running",
        }
    )


@csrf_exempt
def health_check_detailed(request):
    """Health check detallado que verifica la base de datos"""
    try:
        # Verificar que Django está funcionando
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return JsonResponse(
            {
                "status": "healthy",
                "service": "hotel-backend",
                "database": "connected",
                "timestamp": django.utils.timezone.now().isoformat(),
            }
        )
    except Exception as e:
        return JsonResponse(
            {
                "status": "unhealthy",
                "service": "hotel-backend",
                "error": str(e),
                "timestamp": django.utils.timezone.now().isoformat(),
            },
            status=500,
        )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health_check"),
    path("health/detailed/", health_check_detailed, name="health_check_detailed"),
    # API REST
    path("api/", include("reservas.api_urls")),
    path("api-auth/", include("rest_framework.urls")),
    # path("api-docs/", include_docs_urls(title="Hotel API")),
    # Vistas de Django
    path("", include("reservas.urls")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
