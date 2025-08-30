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
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = ["id"]


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear y actualizar usuarios"""

    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    rol = serializers.ChoiceField(
        choices=PerfilUsuario.ROLES_CHOICES, default="conserge"
    )
    turno = serializers.ChoiceField(
        choices=PerfilUsuario.TURNOS_CHOICES, default="mañana"
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "password",
            "confirm_password",
            "rol",
            "turno",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        # Si es una actualización y no se proporciona password, no validar
        if self.instance and not attrs.get("password"):
            return attrs

        # Para creación o actualización con password
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError("Las contraseñas no coinciden")

        # Validar que el username sea único (solo para creación)
        if not self.instance and attrs.get("username"):
            if User.objects.filter(username=attrs["username"]).exists():
                raise serializers.ValidationError(
                    {"username": "Este nombre de usuario ya existe"}
                )

        # Validar que el email sea único (solo para creación)
        if not self.instance and attrs.get("email"):
            if User.objects.filter(email=attrs["email"]).exists():
                raise serializers.ValidationError(
                    {"email": "Este email ya está registrado"}
                )

        return attrs

    def create(self, validated_data):
        # Extraer campos del perfil
        rol = validated_data.pop("rol", "conserge")
        turno = validated_data.pop("turno", "mañana")
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")

        try:
            # Crear usuario
            user = User.objects.create_user(
                username=validated_data.get("username"),
                email=validated_data.get("email", ""),
                password=password,
                first_name=validated_data.get("first_name", ""),
                last_name=validated_data.get("last_name", ""),
                is_active=validated_data.get("is_active", True),
            )

            # Crear o actualizar perfil de usuario
            perfil, created = PerfilUsuario.objects.get_or_create(
                usuario=user, defaults={"rol": rol, "turno": turno}
            )

            # Si el perfil ya existía, actualizarlo
            if not created:
                perfil.rol = rol
                perfil.turno = turno
                perfil.save()

            return user
        except Exception as e:
            # Si hay un error, eliminar el usuario si se creó
            if "user" in locals():
                user.delete()
            raise serializers.ValidationError(f"Error al crear usuario: {str(e)}")

    def update(self, instance, validated_data):
        # Extraer campos del perfil
        rol = validated_data.pop("rol", None)
        turno = validated_data.pop("turno", None)
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password", None)

        # Actualizar usuario
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        # Actualizar perfil de usuario
        try:
            perfil = instance.perfil
            if rol is not None:
                perfil.rol = rol
            if turno is not None:
                perfil.turno = turno
            perfil.save()
        except PerfilUsuario.DoesNotExist:
            # Si no existe el perfil, crearlo
            PerfilUsuario.objects.create(
                usuario=instance, rol=rol or "conserge", turno=turno or "mañana"
            )

        return instance


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
            "observaciones",
            "telefono",
            "origen",
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
        """Validar que la habitación existe"""
        try:
            habitacion = Habitacion.objects.get(id=value)
            # Por ahora no validamos estado ya que no existe ese campo en el modelo
            # if habitacion.estado != "disponible":
            #     raise serializers.ValidationError(
            #         f"La habitación {habitacion.numero} no está disponible"
            #     )
        except Habitacion.DoesNotExist:
            raise serializers.ValidationError("Habitación no encontrada")
        return value


class UsuarioListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar usuarios"""

    rol = serializers.SerializerMethodField()
    turno = serializers.SerializerMethodField()
    rol_display = serializers.SerializerMethodField()
    turno_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "is_active",
            "rol",
            "turno",
            "rol_display",
            "turno_display",
        ]
        read_only_fields = ["id"]

    def get_rol(self, obj):
        try:
            return obj.perfil.rol
        except PerfilUsuario.DoesNotExist:
            return "conserge"

    def get_turno(self, obj):
        try:
            return obj.perfil.turno
        except PerfilUsuario.DoesNotExist:
            return "mañana"

    def get_rol_display(self, obj):
        try:
            return obj.perfil.get_rol_display()
        except PerfilUsuario.DoesNotExist:
            return "Conserje"

    def get_turno_display(self, obj):
        try:
            return obj.perfil.get_turno_display()
        except PerfilUsuario.DoesNotExist:
            return "Mañana"
