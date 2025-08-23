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
    return JsonResponse({"status": "healthy", "service": "hotel-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health_check"),
    # API REST
    path("api/", include("reservas.api_urls")),
    path("api-auth/", include("rest_framework.urls")),
    # path("api-docs/", include_docs_urls(title="Hotel API")),
    # Vistas de Django
    path("", include("reservas.urls")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
