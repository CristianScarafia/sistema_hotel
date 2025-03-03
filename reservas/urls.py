from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView

from .views import (
    generar_planing,
    cargar_reserva,
    listar_reservas,
    cargar_habitacion,
    listar_habitaciones,
    editar_reserva,
    update_fecha_inicio,
    editar_habitacion,
    eliminar_habitacion,
)

urlpatterns = [
    path("planing/", generar_planing, name="generar_planing"),
    path("cargar_reserva/", cargar_reserva, name="cargar_reserva"),
    path("listar_reservas/", listar_reservas, name="listar_reservas"),
    path("cargar_habitacion/", cargar_habitacion, name="cargar_habitacion"),
    path("listar_habitaciones/", listar_habitaciones, name="listar_habitaciones"),
    path("editar_reserva/<int:reserva_id>/", editar_reserva, name="editar_reserva"),
    path("update_fecha_inicio/", update_fecha_inicio, name="update_fecha_inicio"),
    path(
        "login/",
        LoginView.as_view(template_name="registrations/login.html"),
        name="login",
    ),
    path("logout/", LogoutView.as_view(next_page="login"), name="logout"),
]
