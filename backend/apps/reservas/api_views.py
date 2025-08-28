from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import date, timedelta, datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Reserva, Habitacion, PerfilUsuario
from .serializers import (
    ReservaSerializer,
    HabitacionSerializer,
    UserSerializer,
    UserCreateUpdateSerializer,
    PerfilUsuarioSerializer,
    ReservaListSerializer,
    HabitacionListSerializer,
    EstadisticasSerializer,
    ReservaCreateSerializer,
    UsuarioListSerializer,
)


def is_supervisor(user):
    """Función helper para verificar si el usuario es supervisor"""
    try:
        # Verificar si el usuario es superusuario (tiene todos los permisos)
        if user.is_superuser:
            return True

        # Verificar si tiene perfil y es supervisor
        if hasattr(user, "perfil") and user.perfil:
            return user.perfil.rol == "supervisor"

        return False
    except Exception as e:
        print(f"Error verificando supervisor: {e}")
        return False


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
    permission_classes = [permissions.IsAuthenticated]  # Requerir autenticación

    def get_serializer_class(self):
        if self.action == "list":
            return HabitacionListSerializer
        return HabitacionSerializer

    def create(self, request, *args, **kwargs):
        """Crear habitación - solo supervisores"""
        print(f"=== CREANDO HABITACIÓN ===")
        print(f"Usuario: {request.user.username}")
        print(f"Es superusuario: {request.user.is_superuser}")
        print(f"Es supervisor: {self._is_supervisor(request.user)}")

        if not self._is_supervisor(request.user):
            print(f"❌ Acceso denegado para {request.user.username}")
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden crear habitaciones."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        print(f"✅ Acceso permitido para {request.user.username}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Actualizar habitación - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden editar habitaciones."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Eliminar habitación - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden eliminar habitaciones."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def _is_supervisor(self, user):
        """Verificar si el usuario es supervisor"""
        return is_supervisor(user)

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
    permission_classes = [permissions.IsAuthenticated]  # Requerir autenticación

    def get_serializer_class(self):
        if self.action == "list":
            return ReservaListSerializer
        elif self.action == "create":
            return ReservaCreateSerializer
        return ReservaSerializer

    def update(self, request, *args, **kwargs):
        """Actualizar reserva - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden editar reservas."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Eliminar reserva - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden eliminar reservas."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def _is_supervisor(self, user):
        """Verificar si el usuario es supervisor"""
        return is_supervisor(user)

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
        # Debug: verificar autenticación
        print(f"=== DEBUG POR_FECHA ===")
        print(f"Usuario autenticado: {request.user.is_authenticated}")
        print(f"Usuario: {request.user}")
        print(f"Headers: {dict(request.headers)}")

        # Temporalmente permitir acceso sin autenticación para pruebas
        if not request.user.is_authenticated:
            print("Usuario no autenticado, pero continuando para pruebas...")

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
            ).select_related(
                "nhabitacion"
            )  # Optimizar consulta

            # Calcular total de personas para el día actual
            total_personas_actual = (
                reservas.aggregate(total=Sum("personas"))["total"] or 0
            )

            # Cálculo de medialunas para el día siguiente basado en las personas del día actual
            medialunas_necesarias = (total_personas_actual * 2.5) / 12
            docenas_medialunas = round(medialunas_necesarias, 1)
            fecha_siguiente = fecha + timedelta(days=1)

            serializer = ReservaListSerializer(reservas, many=True)
            return Response(
                {
                    "reservas": serializer.data,
                    "medialunas": {
                        "fecha_siguiente": fecha_siguiente.isoformat(),
                        "total_personas": total_personas_actual,
                        "docenas_necesarias": docenas_medialunas,
                        "medialunas_totales": round(total_personas_actual * 2.5, 0),
                    },
                    "total_personas_actual": total_personas_actual,
                }
            )
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

    @action(detail=False, methods=["get"])
    def limpieza(self, request):
        """Obtener datos de limpieza para una fecha específica"""
        # Debug: verificar autenticación
        print(f"=== DEBUG LIMPIEZA ===")
        print(f"Usuario autenticado: {request.user.is_authenticated}")
        print(f"Usuario: {request.user}")
        print(f"Headers: {dict(request.headers)}")

        # Temporalmente permitir acceso sin autenticación para pruebas
        if not request.user.is_authenticated:
            print("Usuario no autenticado, pero continuando para pruebas...")

        fecha_str = request.GET.get("fecha")

        if not fecha_str:
            fecha_str = date.today().isoformat()

        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except ValueError:
            fecha = date.today()

        # Obtener todas las habitaciones
        habitaciones = Habitacion.objects.all()

        # Obtener reservas activas para la fecha
        reservas_activas = Reserva.objects.filter(
            fecha_ingreso__lte=fecha, fecha_egreso__gt=fecha
        ).select_related("nhabitacion")

        # Habitaciones ocupadas
        habitaciones_ocupadas = set(
            reservas_activas.values_list("nhabitacion_id", flat=True)
        )

        # Habitaciones a limpiar (se fueron los pasajeros)
        a_limpiar = []
        # Habitaciones a pasajero (está el pasajero pero hay que repasar)
        a_pasajero = []
        # Habitaciones a limpiar + pasajero (4ª noche, tiene al menos 1 noche más)
        a_limpiar_pasajero = []

        for habitacion in habitaciones:
            if habitacion.id in habitaciones_ocupadas:
                # Buscar la reserva activa para esta habitación
                reserva = reservas_activas.filter(nhabitacion=habitacion).first()

                if reserva:
                    # Calcular noches de estadía hasta la fecha
                    noches_estadia = (fecha - reserva.fecha_ingreso).days

                    # Si es la 4ª noche o más y tiene al menos 1 noche más
                    if (
                        noches_estadia >= 3
                        and reserva.fecha_egreso > fecha + timedelta(days=1)
                    ):
                        a_limpiar_pasajero.append(
                            {
                                "id": habitacion.id,
                                "numero": habitacion.numero,
                                "tipo": habitacion.tipo,
                                "noches_estadia": noches_estadia + 1,
                            }
                        )
                    else:
                        # Repaso normal
                        a_pasajero.append(
                            {
                                "id": habitacion.id,
                                "numero": habitacion.numero,
                                "tipo": habitacion.tipo,
                                "noches_estadia": noches_estadia + 1,
                            }
                        )
            else:
                # Habitación disponible - verificar si se fue alguien ayer
                reserva_ayer = Reserva.objects.filter(
                    nhabitacion=habitacion, fecha_egreso=fecha
                ).first()

                if reserva_ayer:
                    a_limpiar.append(
                        {
                            "id": habitacion.id,
                            "numero": habitacion.numero,
                            "tipo": habitacion.tipo,
                        }
                    )

        return Response(
            {
                "a_limpiar": a_limpiar,
                "a_pasajero": a_pasajero,
                "a_limpiar_pasajero": a_limpiar_pasajero,
                "fecha": fecha.isoformat(),
            }
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


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo User"""

    from django.contrib.auth.models import User

    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]  # Requerir autenticación

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return UserCreateUpdateSerializer
        elif self.action == "list":
            return UsuarioListSerializer
        return UserSerializer

    def list(self, request, *args, **kwargs):
        """Listar usuarios con logs de depuración"""
        # Verificar si el usuario es supervisor
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden ver usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        print("=== LISTANDO USUARIOS ===")
        queryset = self.get_queryset()
        print(f"Queryset: {queryset}")
        print(f"Cantidad de usuarios: {queryset.count()}")

        serializer = self.get_serializer(queryset, many=True)
        print(f"Datos serializados: {serializer.data}")

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Crear usuario - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden crear usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Actualizar usuario - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden editar usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Eliminar usuario - solo supervisores"""
        if not self._is_supervisor(request.user):
            return Response(
                {
                    "error": "Acceso denegado. Solo los supervisores pueden eliminar usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def _is_supervisor(self, user):
        """Verificar si el usuario es supervisor"""
        return is_supervisor(user)

    def perform_create(self, serializer):
        """Crear usuario con contraseña encriptada"""
        print("=== CREANDO USUARIO ===")
        user = serializer.save()
        print(f"Usuario creado: {user.username}")
        return user

    def perform_update(self, serializer):
        """Actualizar usuario"""
        user = serializer.save()
        return user


@method_decorator(csrf_exempt, name="dispatch")
class PlanningViewSet(viewsets.ViewSet):
    """ViewSet para el planning de reservas"""

    permission_classes = [permissions.AllowAny]  # Permitir acceso sin autenticación

    @action(detail=False, methods=["get"])
    def planning(self, request):
        """Obtener datos del planning de reservas"""
        start_date_str = request.GET.get("start_date")

        if start_date_str:
            try:
                first_day = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            except ValueError:
                first_day = date.today().replace(day=1)
        else:
            first_day = date.today().replace(day=1)

        # Generar 60 días desde la fecha de inicio
        days = [first_day + timedelta(days=i) for i in range(60)]

        # Obtener todas las habitaciones ordenadas por tipo
        habitaciones = list(Habitacion.objects.all())
        tipo_orden = {"doble": 1, "triple": 2, "cuadruple": 3, "quintuple": 4}
        habitaciones.sort(key=lambda x: tipo_orden.get(x.tipo, 5))

        # Obtener reservas que se superponen con el período
        reservas = Reserva.objects.filter(
            fecha_ingreso__lte=days[-1], fecha_egreso__gte=days[0]
        ).select_related("nhabitacion")

        planning_data = []
        for habitacion in habitaciones:
            ocupaciones = []
            nombre_mostrado = set()
            reservas_habitacion = reservas.filter(nhabitacion=habitacion)

            for day in days:
                ocupacion = None
                for reserva in reservas_habitacion:
                    if reserva.fecha_ingreso <= day < reserva.fecha_egreso:
                        if (
                            day == reserva.fecha_ingreso
                            and reserva.id not in nombre_mostrado
                        ):
                            nombre_mostrado.add(reserva.id)
                            ocupacion = {
                                "is_occupied": True,
                                "is_last_night": day
                                == reserva.fecha_egreso - timedelta(days=1),
                                "nombre": reserva.nombre,
                                "reserva_id": reserva.id,
                                "fecha_ingreso": reserva.fecha_ingreso.isoformat(),
                                "fecha_egreso": reserva.fecha_egreso.isoformat(),
                            }
                        else:
                            ocupacion = {
                                "is_occupied": True,
                                "is_last_night": day
                                == reserva.fecha_egreso - timedelta(days=1),
                                "nombre": None,
                                "reserva_id": reserva.id,
                                "fecha_ingreso": reserva.fecha_ingreso.isoformat(),
                                "fecha_egreso": reserva.fecha_egreso.isoformat(),
                            }
                        break

                if not ocupacion:
                    ocupacion = {
                        "is_occupied": False,
                        "is_last_night": False,
                        "nombre": None,
                        "reserva_id": None,
                        "fecha_ingreso": None,
                        "fecha_egreso": None,
                    }

                ocupaciones.append(ocupacion)

            planning_data.append(
                {
                    "habitacion": {
                        "id": habitacion.id,
                        "numero": habitacion.numero,
                        "tipo": habitacion.tipo,
                        "piso": habitacion.piso,
                    },
                    "ocupaciones": ocupaciones,
                }
            )

        return Response(
            {
                "planning": planning_data,
                "days": [day.isoformat() for day in days],
                "first_day": first_day.isoformat(),
            }
        )
