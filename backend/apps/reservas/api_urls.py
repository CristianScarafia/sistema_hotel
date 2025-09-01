from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from .api_views import (
    HabitacionViewSet,
    ReservaViewSet,
    PerfilUsuarioViewSet,
    EstadisticasView,
    DashboardView,
    AuthView,
    CsrfTokenView,
    FixAdminView,
    UsuarioViewSet,
    PlanningViewSet,
)


def api_root(request):
    """Endpoint raíz de la API"""
    return JsonResponse(
        {
            "message": "Hotel API",
            "version": "1.0",
            "endpoints": {
                "auth": "/api/auth/",
                "reservas": "/api/reservas/",
                "habitaciones": "/api/habitaciones/",
                "usuarios": "/api/usuarios/",
            },
        }
    )


# Configurar el router
router = DefaultRouter()
router.register(r"habitaciones", HabitacionViewSet)
router.register(r"reservas", ReservaViewSet, basename="reservas")
router.register(r"perfiles", PerfilUsuarioViewSet)
router.register(r"usuarios", UsuarioViewSet)
router.register(r"planning", PlanningViewSet, basename="planning")

# URLs de la API
urlpatterns = [
    # Endpoint raíz de la API (público)
    path("", api_root, name="api_root"),
    # Rutas del router (CRUD automático)
    path("", include(router.urls)),
    # Autenticación
    path("auth/", AuthView.as_view(), name="api_auth"),
    path("csrf/", CsrfTokenView.as_view(), name="api_csrf"),
    path("fix-admin/", FixAdminView.as_view(), name="api_fix_admin"),
    # Rutas personalizadas
    path("estadisticas/", EstadisticasView.as_view(), name="api_estadisticas"),
    path("dashboard/", DashboardView.as_view(), name="api_dashboard"),
    # Endpoints adicionales
    path(
        "habitaciones/disponibles/",
        HabitacionViewSet.as_view({"get": "disponibles"}),
        name="api_habitaciones_disponibles",
    ),
    path(
        "habitaciones/ocupadas/",
        HabitacionViewSet.as_view({"get": "ocupadas"}),
        name="api_habitaciones_ocupadas",
    ),
    path(
        "habitaciones/por-tipo/",
        HabitacionViewSet.as_view({"get": "por_tipo"}),
        name="api_habitaciones_por_tipo",
    ),
    path(
        "reservas/hoy/", ReservaViewSet.as_view({"get": "hoy"}), name="api_reservas_hoy"
    ),
    path(
        "reservas/checkins-hoy/",
        ReservaViewSet.as_view({"get": "checkins_hoy"}),
        name="api_checkins_hoy",
    ),
    path(
        "reservas/checkouts-hoy/",
        ReservaViewSet.as_view({"get": "checkouts_hoy"}),
        name="api_checkouts_hoy",
    ),
    path(
        "reservas/por_fecha/",
        ReservaViewSet.as_view({"get": "por_fecha"}),
        name="api_reservas_por_fecha",
    ),
    path(
        "reservas/por-habitacion/",
        ReservaViewSet.as_view({"get": "por_habitacion"}),
        name="api_reservas_por_habitacion",
    ),
    path(
        "reservas/limpieza/",
        ReservaViewSet.as_view({"get": "limpieza"}),
        name="api_reservas_limpieza",
    ),
    path(
        "reservas/importar/",
        ReservaViewSet.as_view({"post": "importar"}),
        name="api_reservas_importar",
    ),
    # La acción mi-perfil ahora está registrada via @action(url_path='mi-perfil') en el ViewSet
]
