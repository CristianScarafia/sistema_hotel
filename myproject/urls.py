from django.contrib import admin
from django.urls import include, path
from reservas.views import home
from reservas import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("reservas/", include("reservas.urls")),
    path(
        "eliminar_reserva/<int:reserva_id>/",
        views.eliminar_reserva,
        name="eliminar_reserva",
    ),
    path(
        "planning/", views.generar_planing, name="planning"
    ),  # Ruta correcta para generar_planing
    path("", home, name="home"),
    path("__debug__/", include("debug_toolbar.urls")),
    path(
        "update_checkins_checkouts/",
        views.update_checkins_checkouts,
        name="update_checkins_checkouts",
    ),
    path("update_fecha_inicio/", views.update_fecha_inicio, name="update_fin"),
    path(
        "reservas/detalle/<int:reserva_id>/",
        views.detalle_reserva,
        name="detalle_reserva",
    ),
    path(
        "detalles_habitacion/<int:numero_habitacion>/",
        views.detalles_habitacion,
        name="detalles_habitacion",
    ),
    path(
        "editar_habitacion/<int:habitacion_id>/",
        views.editar_habitacion,
        name="editar_habitacion",
    ),
    path(
        "eliminar_habitacion/<int:habitacion_id>/",
        views.eliminar_habitacion,
        name="eliminar_habitacion",
    ),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
