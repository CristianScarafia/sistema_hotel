from django.urls import path
from .views import generar_planing, cargar_reserva, listar_reservas, cargar_habitacion, listar_habitaciones

urlpatterns = [
    path('planing/', generar_planing, name='generar_planing'),
    path('cargar_reserva/', cargar_reserva, name='cargar_reserva'),
    path('listar_reservas/', listar_reservas, name='listar_reservas'),
    path('cargar_habitacion/', cargar_habitacion, name='cargar_habitacion'),
    path('listar_habitaciones/', listar_habitaciones, name='listar_habitaciones'),
]