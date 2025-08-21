from rest_framework import serializers
from .models import Reserva, Habitacion, PerfilUsuario
from django.contrib.auth.models import User


class HabitacionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Habitacion"""

    class Meta:
        model = Habitacion
        fields = ["id", "numero", "tipo", "piso"]
        read_only_fields = ["id"]


class ReservaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Reserva"""

    habitacion = HabitacionSerializer(read_only=True)
    habitacion_id = serializers.IntegerField(write_only=True, source="nhabitacion_id")

    class Meta:
        model = Reserva
        fields = [
            "id",
            "nombre",
            "apellido",
            "telefono",
            "fecha_ingreso",
            "fecha_egreso",
            "noches",
            "personas",
            "monto_total",
            "senia",
            "resto",
            "precio_por_noche",
            "origen",
            "observaciones",
            "encargado",
            "habitacion",
            "habitacion_id",
            "cantidad_habitaciones",
            "celiacos",
        ]
        read_only_fields = ["id", "noches", "resto", "precio_por_noche"]

    def validate(self, data):
        """Validación personalizada"""
        fecha_ingreso = data.get("fecha_ingreso")
        fecha_egreso = data.get("fecha_egreso")

        if fecha_ingreso and fecha_egreso:
            if fecha_ingreso >= fecha_egreso:
                raise serializers.ValidationError(
                    "La fecha de ingreso debe ser anterior a la fecha de egreso"
                )

        return data

    def create(self, validated_data):
        """Crear reserva con cálculos automáticos"""
        habitacion_id = validated_data.pop("habitacion_id")
        habitacion = Habitacion.objects.get(id=habitacion_id)

        # Calcular noches
        noches = (validated_data["fecha_egreso"] - validated_data["fecha_ingreso"]).days
        validated_data["noches"] = noches

        # Calcular precio por noche
        if noches > 0:
            validated_data["precio_por_noche"] = validated_data["monto_total"] / noches
        else:
            validated_data["precio_por_noche"] = 0

        # Calcular resto
        validated_data["resto"] = (
            validated_data["monto_total"] - validated_data["senia"]
        )

        # Asignar habitación
        validated_data["nhabitacion"] = habitacion

        return super().create(validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Serializer para el modelo User"""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_active"]
        read_only_fields = ["id"]


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo PerfilUsuario"""

    usuario = UserSerializer(read_only=True)

    class Meta:
        model = PerfilUsuario
        fields = ["id", "usuario", "rol", "turno", "es_supervisor"]
        read_only_fields = ["id", "es_supervisor"]


class ReservaListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar reservas"""

    habitacion_numero = serializers.CharField(
        source="nhabitacion.numero", read_only=True
    )
    habitacion_tipo = serializers.CharField(source="nhabitacion.tipo", read_only=True)
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            "id",
            "nombre_completo",
            "fecha_ingreso",
            "fecha_egreso",
            "noches",
            "personas",
            "monto_total",
            "habitacion_numero",
            "habitacion_tipo",
            "encargado",
        ]
        read_only_fields = ["id", "noches"]

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}"


class HabitacionListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar habitaciones"""

    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)

    class Meta:
        model = Habitacion
        fields = [
            "id",
            "numero",
            "tipo",
            "tipo_display",
            "piso",
        ]
        read_only_fields = ["id"]


# Serializers para estadísticas y reportes
class EstadisticasSerializer(serializers.Serializer):
    """Serializer para estadísticas generales"""

    total_reservas = serializers.IntegerField()
    total_habitaciones = serializers.IntegerField()
    habitaciones_ocupadas = serializers.IntegerField()
    habitaciones_disponibles = serializers.IntegerField()
    ingresos_totales = serializers.DecimalField(max_digits=10, decimal_places=2)
    reservas_hoy = serializers.IntegerField()
    checkouts_hoy = serializers.IntegerField()


class ReservaCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para crear reservas"""

    habitacion_id = serializers.IntegerField(source="nhabitacion_id")

    class Meta:
        model = Reserva
        fields = [
            "nombre",
            "apellido",
            "telefono",
            "fecha_ingreso",
            "fecha_egreso",
            "personas",
            "monto_total",
            "senia",
            "origen",
            "observaciones",
            "habitacion_id",
            "encargado",
            "cantidad_habitaciones",
            "celiacos",
        ]

    def validate_habitacion_id(self, value):
        """Validar que la habitación existe y está disponible"""
        try:
            habitacion = Habitacion.objects.get(id=value)
            if habitacion.estado != "disponible":
                raise serializers.ValidationError(
                    f"La habitación {habitacion.numero} no está disponible"
                )
        except Habitacion.DoesNotExist:
            raise serializers.ValidationError("Habitación no encontrada")
        return value
