from django.contrib import admin
from django.urls import include, path
from reservas.views import home
from reservas import views
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.auth.views import LoginView, LogoutView

# from rest_framework.documentation import include_docs_urls

urlpatterns = [
    path("admin/", admin.site.urls),
    # API REST
    path("api/", include("reservas.api_urls")),
    path("api-auth/", include("rest_framework.urls")),
    # path("api-docs/", include_docs_urls(title="Hotel API")),
    # Redirigir la raíz a la API para mostrar la interfaz de DRF
    path("", include("reservas.api_urls")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
