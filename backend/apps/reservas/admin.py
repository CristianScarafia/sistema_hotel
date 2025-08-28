from django.contrib import admin
from .models import Habitacion, Reserva, PerfilUsuario

# Register your models here.
@admin.register(Habitacion)
class HabitacionAdmin(admin.ModelAdmin):
    list_display = ['numero', 'tipo', 'piso']
    list_filter = ['tipo', 'piso']
    search_fields = ['numero']

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'apellido', 'nhabitacion', 'fecha_ingreso', 'fecha_egreso', 'monto_total']
    list_filter = ['fecha_ingreso', 'fecha_egreso', 'encargado']
    search_fields = ['nombre', 'apellido', 'nhabitacion__numero']
    date_hierarchy = 'fecha_ingreso'

@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'rol', 'turno', 'fecha_creacion', 'activo']
    list_filter = ['rol', 'turno', 'activo', 'fecha_creacion']
    search_fields = ['usuario__username', 'usuario__first_name', 'usuario__last_name']
    readonly_fields = ['fecha_creacion']
