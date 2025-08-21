from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView

from .views import (
    generar_planing,
    cargar_reserva,
    listar_reservas,
    cargar_habitacion,
    listar_habitaciones,
    editar_reserva,
    eliminar_reserva,
    update_fecha_inicio,
    editar_habitacion,
    eliminar_habitacion,
    crear_usuario,
    custom_login,
    home,
    detalle_reserva,
    test_toastr,
    test_alerts,
    test_alerts_ajax,
)

urlpatterns = [
    path("", home, name="home"),
    path("planing/", generar_planing, name="generar_planing"),
    path("cargar_reserva/", cargar_reserva, name="cargar_reserva"),
    path("listar_reservas/", listar_reservas, name="listar_reservas"),
    path("cargar_habitacion/", cargar_habitacion, name="cargar_habitacion"),
    path("listar_habitaciones/", listar_habitaciones, name="listar_habitaciones"),
    path("editar_reserva/<int:reserva_id>/", editar_reserva, name="editar_reserva"),
    path(
        "eliminar_reserva/<int:reserva_id>/", eliminar_reserva, name="eliminar_reserva"
    ),
    path(
        "editar_habitacion/<int:habitacion_id>/",
        editar_habitacion,
        name="editar_habitacion",
    ),
    path(
        "eliminar_habitacion/<int:habitacion_id>/",
        eliminar_habitacion,
        name="eliminar_habitacion",
    ),
    path("detalle_reserva/<int:reserva_id>/", detalle_reserva, name="detalle_reserva"),
    path("update_fecha_inicio/", update_fecha_inicio, name="update_fecha_inicio"),
    path("crear_usuario/", crear_usuario, name="crear_usuario"),
    path("login/", custom_login, name="login"),
    path("logout/", LogoutView.as_view(next_page="login"), name="logout"),
    path("test-toastr/", test_toastr, name="test_toastr"),
    path("test-alerts/", test_alerts, name="test_alerts"),
    path("test-alerts-ajax/", test_alerts_ajax, name="test_alerts_ajax"),
]
