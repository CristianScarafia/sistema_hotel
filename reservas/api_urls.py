from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    HabitacionViewSet,
    ReservaViewSet,
    PerfilUsuarioViewSet,
    EstadisticasView,
    DashboardView,
    AuthView,
    UsuarioViewSet,
    PlanningViewSet,
)

# Configurar el router
router = DefaultRouter()
router.register(r"habitaciones", HabitacionViewSet)
router.register(r"reservas", ReservaViewSet)
router.register(r"perfiles", PerfilUsuarioViewSet)
router.register(r"usuarios", UsuarioViewSet)
router.register(r'planning', PlanningViewSet, basename='planning')

# URLs de la API
urlpatterns = [
    # Rutas del router (CRUD automático)
    path("", include(router.urls)),
    # Autenticación
    path("auth/", AuthView.as_view(), name="api_auth"),
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
        "reservas/por-fecha/",
        ReservaViewSet.as_view({"get": "por_fecha"}),
        name="api_reservas_por_fecha",
    ),
    path(
        "reservas/por-habitacion/",
        ReservaViewSet.as_view({"get": "por_habitacion"}),
        name="api_reservas_por_habitacion",
    ),
    path(
        "perfiles/mi-perfil/",
        PerfilUsuarioViewSet.as_view({"get": "mi_perfil"}),
        name="api_mi_perfil",
    ),
]
