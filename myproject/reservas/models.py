from django.db import models

class Habitacion(models.Model):
    numero = models.CharField(max_length=10)
    tipo = models.CharField(max_length=50, default='doble')
    piso = models.CharField(max_length=20, default='0')
    def __str__(self):
        return self.numero


class Reserva(models.Model):
    encargado = models.CharField(max_length=100, null=False)
    nhabitacion = models.CharField(max_length=20, null=False)
    nombre = models.CharField(max_length=100, null=False)
    apellido = models.CharField(max_length=100, default='Apellido', null=False)
    personas = models.IntegerField(null=False, default=1)
    fecha_ingreso = models.DateField(null=False)
    fecha_egreso = models.DateField(null=False)
    noches = models.IntegerField(editable=False, null=False)
    precio_por_noche = models.FloatField(editable=False, default=0)
    monto_total = models.FloatField(null=False)
    senia = models.FloatField(null=False)
    resto = models.FloatField(editable=False, null=False)
    cantidad_habitaciones = models.IntegerField(null=False)
    telefono = models.CharField(max_length=20, null=False)
    celiacos = models.BooleanField(default=False, null=False)
    observaciones = models.TextField(blank=True, null=False)
    origen = models.CharField(max_length=100, null=False)

    def save(self, *args, **kwargs):
        self.noches = (self.fecha_egreso - self.fecha_ingreso).days
        self.precio_por_noche = self.monto_total / self.noches if self.noches else 0
        self.resto = self.monto_total - self.senia
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.nombre} - {self.habitacion} ({self.fecha_ingreso} to {self.fecha_egreso})"
    def get_nombre_huesped(self):
        return self.nombre