from django.shortcuts import render, redirect, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from .models import Reserva, Habitacion
from datetime import datetime, timedelta, date
from .forms import HabitacionForm, ReservaForm
from django.db.models import Q 
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def custom_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def get_dollar_rate():
    url = 'https://www.bloomberg.com/quote/USDARS:CUR'
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        quote = soup.find('div', class_='sized-price media-ui-SizedPrice_extraLarge-05pKbJRbUH8-')

        if quote:
            return quote.text.strip()
    return 'N/A'

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
        print(f"Fecha obtenida de la URL: {start_date_str}")
    else:
        if 'last_start_date' in request.session:
            first_day = datetime.strptime(request.session['last_start_date'], '%Y-%m-%d').date()
            print(f"Fecha obtenida de la sesión: {request.session['last_start_date']}")
        else:
            first_day = date.today().replace(day=1)
            print("No se encontró fecha en la URL ni en la sesión, usando la fecha por defecto:", first_day)
    
    days = [first_day + timedelta(days=i) for i in range(60)]
    print("Días generados para el planning:", days)

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
    ).select_related('nhabitacion')

    planing = []
    for habitacion in habitaciones:
        ocupaciones = []
        nombre_mostrado = set()
        reservas_habitacion = reservas.filter(nhabitacion=habitacion)
        for day in days:
            ocupacion = None
            for reserva in reservas_habitacion:
                if reserva.fecha_ingreso <= day < reserva.fecha_egreso:
                    if day == reserva.fecha_ingreso and reserva.id not in nombre_mostrado:
                        nombre_mostrado.add(reserva.id)
                        ocupacion = {
                            'is_occupied': True,
                            'is_last_night': day == reserva.fecha_egreso - timedelta(days=1),
                            'nombre': reserva.nombre
                        }
                    else:
                        ocupacion = {
                            'is_occupied': True,
                            'is_last_night': day == reserva.fecha_egreso - timedelta(days=1),
                            'nombre': None
                        }
                    break
            if not ocupacion:
                ocupacion = {
                    'is_occupied': False,
                    'is_last_night': False,
                    'nombre': None
                }
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
    
@csrf_exempt
def update_fecha_inicio(request):
    if request.method == 'POST':
        new_date = request.POST.get('new_date')
        if new_date:
            try:
                request.session['last_start_date'] = new_date
                print('Fecha recibida y guardada en sesión:', new_date)
                return JsonResponse({'status': 'success'})
            except Exception as e:
                print('Error al guardar la fecha:', str(e))
                return JsonResponse({'status': 'error', 'message': str(e)})
        else:
            print('No se recibió una nueva fecha.')
            return JsonResponse({'status': 'error', 'message': 'No se recibió una nueva fecha.'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

 
def listar_habitaciones(request):
    habitaciones = Habitacion.objects.all()
    return render(request, 'reservas/listar_habitaciones.html', {'habitaciones': habitaciones})

def editar_habitacion(request, habitacion_id):
    habitacion = get_object_or_404(Habitacion, id=habitacion_id)
    
    if request.method == 'POST':
        form = HabitacionForm(request.POST, instance=habitacion)
        if form.is_valid():
            form.save()
            messages.success(request, 'Habitación actualizada con éxito.')
            return redirect('listar_habitaciones')  # Redirige a la lista de habitaciones después de guardar
    else:
        form = HabitacionForm(instance=habitacion)
    
    return render(request, 'reservas/editar_habitacion.html', {'form': form, 'habitacion': habitacion})

def eliminar_habitacion(request, habitacion_id):
    habitacion = get_object_or_404(Habitacion, id=habitacion_id)
    if request.method == 'POST':
        habitacion.delete()
        messages.success(request, 'Habitación eliminada con éxito.')
        return redirect('listar_habitaciones')
    return render(request, 'reservas/eliminar_habitacion.html', {'habitacion': habitacion})

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

def obtener_estado_habitaciones():
    today = datetime.today().date()
    reservas_hoy = Reserva.objects.filter(fecha_ingreso__lte=today, fecha_egreso__gt=today)

    habitaciones = Habitacion.objects.all()
    estado_habitaciones = []

    for habitacion in habitaciones:
        ocupada = reservas_hoy.filter(nhabitacion=habitacion).exists()
        estado_habitaciones.append({
            'numero': habitacion.numero,
            'tipo': habitacion.tipo,
            'ocupada': ocupada
        })
    
    return estado_habitaciones
def detalles_habitacion(request, numero_habitacion):
    habitacion = get_object_or_404(Habitacion, numero=numero_habitacion)
    reservas = Reserva.objects.filter(nhabitacion=habitacion).order_by('-fecha_ingreso')

    detalles = {
        'habitacion': habitacion.numero,
        'tipo': habitacion.tipo,
        'reservas': [
            {
                'nombre': reserva.nombre,
                'apellido': reserva.apellido,
                'fecha_ingreso': reserva.fecha_ingreso,
                'fecha_egreso': reserva.fecha_egreso,
            } for reserva in reservas
        ]
    }

    return JsonResponse(detalles)


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

    # Obtener el estado de todas las habitaciones para el día seleccionado
    habitaciones = Habitacion.objects.all()
    estado_habitaciones = []    

    for habitacion in habitaciones:
        ocupada = habitaciones_ocupadas.filter(id=habitacion.id).exists()
        estado_habitaciones.append({
            'numero': habitacion.numero,
            'tipo': habitacion.tipo,
            'ocupada': ocupada
        })

    habitaciones_disponibles = []
    for habitacion in habitaciones:
        reservas_habitacion = Reserva.objects.filter(nhabitacion=habitacion).order_by('fecha_ingreso')
        hoy_ocupada = reservas_habitacion.filter(fecha_ingreso__lte=date.today(), fecha_egreso__gte=date.today()).exists()
        
        if not hoy_ocupada:
            proxima_reserva = reservas_habitacion.filter(fecha_ingreso__gt=date.today()).first()
            if proxima_reserva:
                dias_disponibles = (proxima_reserva.fecha_ingreso - date.today()).days
            else:
                dias_disponibles = 30  # Asumir 30 días disponibles si no hay reservas futuras
            habitaciones_disponibles.append({
                'numero': habitacion.numero,
                'tipo': habitacion.tipo,
                'dias_disponibles': dias_disponibles
            })
    
    for reserva in checkin:
        reserva.monto_total_formatted = "${:,.2f}".format(reserva.monto_total).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.senia_formatted = "${:,.2f}".format(reserva.senia).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.resto_formatted = "${:,.2f}".format(reserva.resto).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.precio_por_noche_formatted = "${:,.2f}".format(reserva.precio_por_noche).replace(",", "X").replace(".", ",").replace("X", ".")
    
    for reserva in checkout:
        reserva.monto_total_formatted = "${:,.2f}".format(reserva.monto_total).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.senia_formatted = "${:,.2f}".format(reserva.senia).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.resto_formatted = "${:,.2f}".format(reserva.resto).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.precio_por_noche_formatted = "${:,.2f}".format(reserva.precio_por_noche).replace(",", "X").replace(".", ",").replace("X", ".")
    
    # Obtener últimas reservas
    reservas = Reserva.objects.all().order_by('-id')[:5]

    dollar_rate = get_dollar_rate()

    return render(request, 'home.html', {
        'reservas': reservas,
        'checkin': checkin,
        'checkout': checkout,
        'habitaciones_disponibles': habitaciones_disponibles,
        'estado_habitaciones': estado_habitaciones,
        'selected_date': selected_date,
        'dollar_rate': dollar_rate,
    })
def detalle_reserva(request, reserva_id):
    reserva = get_object_or_404(Reserva, pk=reserva_id)
    reserva.monto_total_formatted = "${:,.2f}".format(reserva.monto_total).replace(",", "X").replace(".", ",").replace("X", ".")
    reserva.senia_formatted = "${:,.2f}".format(reserva.senia).replace(",", "X").replace(".", ",").replace("X", ".")
    reserva.resto_formatted = "${:,.2f}".format(reserva.resto).replace(",", "X").replace(".", ",").replace("X", ".")
    reserva.precio_por_noche_formatted = "${:,.2f}".format(reserva.precio_por_noche).replace(",", "X").replace(".", ",").replace("X", ".")

    return render(request, 'detalle_reserva.html', {'reserva': reserva})

def eliminar_reserva(request, reserva_id):
    reserva = get_object_or_404(Reserva, id=reserva_id)
    if request.method == 'POST':
        reserva.delete()
        messages.success(request, 'Reserva eliminada con éxito.')
        return redirect('listar_reservas')
    return render(request, 'reservas/listar_reservas.html')

def listar_reservas(request):
    reservas = Reserva.objects.all()
    for reserva in reservas:
        reserva.monto_total_formatted = "${:,.2f}".format(reserva.monto_total).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.senia_formatted = "${:,.2f}".format(reserva.senia).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.resto_formatted = "${:,.2f}".format(reserva.resto).replace(",", "X").replace(".", ",").replace("X", ".")
        reserva.precio_por_noche_formatted = "${:,.2f}".format(reserva.precio_por_noche).replace(",", "X").replace(".", ",").replace("X", ".")
    
    return render(request, 'reservas/listar_reservas.html', {
        'reservas': reservas
    })

def editar_reserva(request, reserva_id):
    reserva = Reserva.objects.get(id=reserva_id)
    if request.method == 'POST':
        form = ReservaForm(request.POST, instance=reserva)
        if form.is_valid():
            form.save()
            return redirect('listar_reservas')
    else:
        form = ReservaForm(instance=reserva)
    return render(request, 'reservas/editar_reserva.html', {'form': form})


