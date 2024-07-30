from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Reserva, Habitacion
from datetime import datetime, timedelta, date
from .forms import HabitacionForm, ReservaForm
from django.db.models import Q

def update_checkins_checkouts(request):
    selected_date_str = request.GET.get('selected_date')
    selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date() if selected_date_str else date.today()

    checkins = Reserva.objects.filter(fecha_ingreso=selected_date)
    checkouts = Reserva.objects.filter(fecha_egreso=selected_date)

    checkins_data = [{
        'nhabitacion': {
            'numero': checkin.nhabitacion.numero
        },
        'nombre': checkin.nombre,
        'apellido': checkin.apellido,
        'fecha_ingreso': checkin.fecha_ingreso,
        'fecha_egreso': checkin.fecha_egreso,
        'personas': checkin.personas,
        'resto': checkin.resto,
        'observaciones': checkin.observaciones,
    } for checkin in checkins]

    checkouts_data = [{
        'nhabitacion': {
            'numero': checkout.nhabitacion.numero
        },
        'nombre': checkout.nombre,
        'apellido': checkout.apellido,
        'fecha_ingreso': checkout.fecha_ingreso,
        'fecha_egreso': checkout.fecha_egreso,
        'personas': checkout.personas,
        'resto': checkout.resto,
        'observaciones': checkout.observaciones,
    } for checkout in checkouts]

    return JsonResponse({
        'checkins': checkins_data,
        'checkouts': checkouts_data
    })

def generar_planing(request):
    start_date_str = request.GET.get('start_date')
    
    if start_date_str:
        request.session['last_start_date'] = start_date_str
        first_day = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    else:
        if 'last_start_date' in request.session:
            first_day = datetime.strptime(request.session['last_start_date'], '%Y-%m-%d').date()
        else:
            first_day = date.today().replace(day=1)
    
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

from django.shortcuts import render
from .models import Reserva, Habitacion

def home(request):
    selected_date = request.GET.get('selected_date', date.today().strftime('%Y-%m-%d'))

    # Obtener las reservas del día seleccionado
    checkin = Reserva.objects.filter(fecha_ingreso=selected_date)
    checkout = Reserva.objects.filter(fecha_egreso=selected_date)

    # Obtener habitaciones ocupadas en la fecha seleccionada
    habitaciones_ocupadas = Habitacion.objects.filter(
        reserva__fecha_ingreso__lte=selected_date, 
        reserva__fecha_egreso__gte=selected_date
    )

    # Obtener habitaciones disponibles
    habitaciones_disponibles = Habitacion.objects.exclude(
        id__in=habitaciones_ocupadas.values_list('id', flat=True)
    )

    # Obtener últimas reservas
    reservas = Reserva.objects.all().order_by('-fecha_ingreso')[:5]

    return render(request, 'home.html', {
        'reservas': reservas,
        'checkin': checkin,
        'checkout': checkout,
        'habitaciones_disponibles': habitaciones_disponibles,
        'selected_date': selected_date
    })