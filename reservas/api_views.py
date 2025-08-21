from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import date, timedelta
from .models import Reserva, Habitacion, PerfilUsuario
from .serializers import (
    ReservaSerializer,
    HabitacionSerializer,
    UserSerializer,
    PerfilUsuarioSerializer,
    ReservaListSerializer,
    HabitacionListSerializer,
    EstadisticasSerializer,
    ReservaCreateSerializer,
)


class AuthView(APIView):
    """Vista para autenticación"""

    authentication_classes = [SessionAuthentication]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Login"""
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Usuario y contraseña son requeridos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            serializer = UserSerializer(user)
            return Response({"user": serializer.data, "message": "Login exitoso"})
        else:
            return Response(
                {"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED
            )

    def delete(self, request):
        """Logout"""
        logout(request)
        return Response({"message": "Logout exitoso"})

    def get(self, request):
        """Obtener usuario actual"""
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        else:
            return Response(
                {"error": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED
            )


class HabitacionViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Habitacion"""

    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return HabitacionListSerializer
        return HabitacionSerializer

    @action(detail=False, methods=["get"])
    def disponibles(self, request):
        """Obtener habitaciones disponibles"""
        # Por ahora retornamos todas las habitaciones ya que no hay campo estado
        habitaciones = Habitacion.objects.all()
        serializer = self.get_serializer(habitaciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def ocupadas(self, request):
        """Obtener habitaciones ocupadas"""
        # Por ahora retornamos todas las habitaciones ya que no hay campo estado
        habitaciones = Habitacion.objects.all()
        serializer = self.get_serializer(habitaciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def por_tipo(self, request):
        """Obtener habitaciones agrupadas por tipo"""
        tipo = request.query_params.get("tipo")
        if tipo:
            habitaciones = Habitacion.objects.filter(tipo=tipo)
        else:
            habitaciones = Habitacion.objects.all()

        serializer = self.get_serializer(habitaciones, many=True)
        return Response(serializer.data)


class ReservaViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Reserva"""

    queryset = Reserva.objects.all().order_by("-id")
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return ReservaListSerializer
        elif self.action == "create":
            return ReservaCreateSerializer
        return ReservaSerializer

    @action(detail=False, methods=["get"])
    def hoy(self, request):
        """Obtener reservas de hoy"""
        hoy = date.today()
        reservas = Reserva.objects.filter(Q(fecha_ingreso=hoy) | Q(fecha_egreso=hoy))
        serializer = self.get_serializer(reservas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def checkins_hoy(self, request):
        """Obtener check-ins de hoy"""
        hoy = date.today()
        reservas = Reserva.objects.filter(fecha_ingreso=hoy)
        serializer = self.get_serializer(reservas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def checkouts_hoy(self, request):
        """Obtener check-outs de hoy"""
        hoy = date.today()
        reservas = Reserva.objects.filter(fecha_egreso=hoy)
        serializer = self.get_serializer(reservas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def por_fecha(self, request):
        """Obtener reservas por fecha específica"""
        fecha_str = request.query_params.get("fecha")
        if not fecha_str:
            return Response(
                {"error": "Parámetro fecha requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            fecha = date.fromisoformat(fecha_str)
            reservas = Reserva.objects.filter(
                Q(fecha_ingreso__lte=fecha) & Q(fecha_egreso__gt=fecha)
            )
            serializer = self.get_serializer(reservas, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {"error": "Formato de fecha inválido (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"])
    def por_habitacion(self, request):
        """Obtener reservas por habitación"""
        habitacion_id = request.query_params.get("habitacion_id")
        if not habitacion_id:
            return Response(
                {"error": "Parámetro habitacion_id requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reservas = Reserva.objects.filter(nhabitacion_id=habitacion_id)
            serializer = self.get_serializer(reservas, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {"error": "ID de habitación inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class EstadisticasView(APIView):
    """Vista para obtener estadísticas generales"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hoy = date.today()

        # Estadísticas básicas
        total_reservas = Reserva.objects.count()
        total_habitaciones = Habitacion.objects.count()
        # Por ahora no hay campo estado, así que todas están disponibles
        habitaciones_ocupadas = 0
        habitaciones_disponibles = total_habitaciones

        # Ingresos totales
        ingresos_totales = (
            Reserva.objects.aggregate(total=Sum("monto_total"))["total"] or 0
        )

        # Reservas de hoy
        reservas_hoy = Reserva.objects.filter(fecha_ingreso=hoy).count()
        checkouts_hoy = Reserva.objects.filter(fecha_egreso=hoy).count()

        data = {
            "total_reservas": total_reservas,
            "total_habitaciones": total_habitaciones,
            "habitaciones_ocupadas": habitaciones_ocupadas,
            "habitaciones_disponibles": habitaciones_disponibles,
            "ingresos_totales": ingresos_totales,
            "reservas_hoy": reservas_hoy,
            "checkouts_hoy": checkouts_hoy,
        }

        serializer = EstadisticasSerializer(data)
        return Response(serializer.data)


class DashboardView(APIView):
    """Vista para datos del dashboard"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hoy = date.today()

        # Últimas reservas
        ultimas_reservas = Reserva.objects.select_related("nhabitacion").order_by(
            "-id"
        )[:5]
        reservas_serializer = ReservaListSerializer(ultimas_reservas, many=True)

        # Check-ins de hoy
        checkins_hoy = Reserva.objects.filter(fecha_ingreso=hoy)
        checkins_serializer = ReservaListSerializer(checkins_hoy, many=True)

        # Check-outs de hoy
        checkouts_hoy = Reserva.objects.filter(fecha_egreso=hoy)
        checkouts_serializer = ReservaListSerializer(checkouts_hoy, many=True)

        # Habitaciones disponibles (todas por ahora)
        habitaciones_disponibles = Habitacion.objects.all()
        habitaciones_serializer = HabitacionListSerializer(
            habitaciones_disponibles, many=True
        )

        data = {
            "ultimas_reservas": reservas_serializer.data,
            "checkins_hoy": checkins_serializer.data,
            "checkouts_hoy": checkouts_serializer.data,
            "habitaciones_disponibles": habitaciones_serializer.data,
        }

        return Response(data)


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo PerfilUsuario"""

    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def mi_perfil(self, request):
        """Obtener perfil del usuario actual"""
        try:
            perfil = PerfilUsuario.objects.get(usuario=request.user)
            serializer = self.get_serializer(perfil)
            return Response(serializer.data)
        except PerfilUsuario.DoesNotExist:
            return Response(
                {"error": "Perfil no encontrado"}, status=status.HTTP_404_NOT_FOUND
            )
