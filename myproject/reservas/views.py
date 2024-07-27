from django.shortcuts import render, redirect
from .models import Reserva, Habitacion
from datetime import datetime, timedelta, date
from .forms import HabitacionForm, ReservaForm

def generar_planing(request):
    start_date_str = request.GET.get('start_date')
    if start_date_str:
        first_day = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    else:
        first_day = date.today().replace(day=1)

    # Calcular los próximos 60 días
    days = [first_day + timedelta(days=i) for i in range(60)]

    habitaciones = list(Habitacion.objects.all())

    tipo_orden = {
        'doble': 1,
        'triple': 2,
        'cuadruple': 3,
        'quintuple': 4
    }

    habitaciones.sort(key=lambda x: tipo_orden.get(x.tipo, 5))

    reservas = Reserva.objects.filter(
        fecha_ingreso__lte=days[-1],
        fecha_egreso__gte=days[0]
    ).select_related('nhabitacion')  # Optimización de la consulta

    planing = []
    for habitacion in habitaciones:
        ocupaciones = []
        nombre_mostrado = False
        reservas_habitacion = reservas.filter(nhabitacion=habitacion)  # Filtrar por habitación una sola vez
        for day in days:
            ocupacion = None
            for reserva in reservas_habitacion:
                if reserva.fecha_ingreso <= day < reserva.fecha_egreso:
                    if day == reserva.fecha_egreso - timedelta(days=1):
                        ocupacion = {
                            'is_occupied': True,
                            'is_last_night': True,
                            'nombre': None
                        }
                    else:
                        ocupacion = {
                            'is_occupied': True,
                            'is_last_night': False,
                            'nombre': reserva.nombre if not nombre_mostrado else None
                        }
                        nombre_mostrado = True
                    break
            ocupaciones.append(ocupacion)
        planing.append({
            'habitacion': habitacion,
            'ocupaciones': ocupaciones
        })

    return render(request, 'reservas/planing.html', {
        'planing': planing,
        'days': days,
        'first_day': first_day
    })

def listar_habitaciones(request):
    habitaciones = Habitacion.objects.all()
    return render(request, 'reservas/listar_habitaciones.html', {'habitaciones': habitaciones})

def cargar_habitacion(request):
    if request.method == 'POST':
        form = HabitacionForm(request.POST)
        if form.is_valid():
            form.save()
            form = HabitacionForm()
    else:
        form = HabitacionForm()
    return render(request, 'reservas/cargar_habitacion.html', {'form': form})

def cargar_reserva(request):
    if request.method == 'POST':
        form = ReservaForm(request.POST)
        if form.is_valid():
            reserva = form.save(commit=False)
            reserva.noches = (reserva.fecha_egreso - reserva.fecha_ingreso).days
            reserva.precio_por_noche = reserva.monto_total / reserva.noches if reserva.noches else 0
            reserva.resto = reserva.monto_total - reserva.senia
            reserva.save()
            return redirect('listar_reservas')  # Puedes cambiar esta redirección si es necesario
    else:
        form = ReservaForm()
    return render(request, 'reservas/cargar_reserva.html', {'form': form})
    
def listar_reservas(request):
    reservas = Reserva.objects.all()
    return render(request, 'reservas/listar_reservas.html', {'reservas': reservas})

def home(request):
    return render(request, 'home.html')