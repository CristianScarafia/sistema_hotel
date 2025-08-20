from django.db import models
from django.contrib.auth.models import User

class Habitacion(models.Model):
    numero = models.CharField(max_length=10)
    tipo = models.CharField(max_length=50, default='doble')
    piso = models.CharField(max_length=50, default='planta baja')

    def __str__(self):
        return self.numero

class Reserva(models.Model):
    encargado = models.CharField(max_length=100, null=False)
    nhabitacion = models.ForeignKey(Habitacion, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100, null=False)
    apellido = models.CharField(max_length=100, null=False)
    personas = models.IntegerField(null=False, default=1)
    fecha_ingreso = models.DateField(null=False)
    fecha_egreso = models.DateField(null=False)
    noches = models.IntegerField(editable=False, null=False, default=1)
    precio_por_noche = models.FloatField(editable=False, default=0)
    monto_total = models.FloatField(null=False)
    senia = models.FloatField(null=False)
    resto = models.FloatField(editable=False, null=False)
    cantidad_habitaciones = models.IntegerField(default=1, null=False)
    telefono = models.CharField(max_length=20, null=False, default=1)
    celiacos = models.BooleanField(default=False, null=False)
    observaciones = models.TextField(blank=True, null=False)
    origen = models.CharField(max_length=100, null=False)

    def __str__(self):
        return f'{self.nombre} {self.apellido} - Habitación {self.nhabitacion.numero}'


    def save(self, *args, **kwargs):
        self.noches = (self.fecha_egreso - self.fecha_ingreso).days
        self.precio_por_noche = self.monto_total / self.noches if self.noches else 0
        self.resto = self.monto_total - self.senia
        super().save(*args, **kwargs)

    def get_nombre_huesped(self):
        return self.nombre

class PerfilUsuario(models.Model):
    ROLES_CHOICES = [
        ('conserge', 'Conserje'),
        ('supervisor', 'Supervisor'),
    ]
    
    TURNOS_CHOICES = [
        ('mañana', 'Mañana'),
        ('tarde', 'Tarde'),
        ('noche', 'Noche'),
    ]
    
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROLES_CHOICES, default='conserge')
    turno = models.CharField(max_length=20, choices=TURNOS_CHOICES, default='mañana')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.usuario.username} - {self.get_rol_display()} ({self.get_turno_display()})"
    
    def es_supervisor(self):
        return self.rol == 'supervisor'
    
    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuario"