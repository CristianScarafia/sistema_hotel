import csv
from django.core.management.base import BaseCommand
from reservas.models import Reserva, Habitacion
from datetime import datetime

def parse_float(value):
    # Elimina el signo de dólar y los puntos de los miles
    value = value.replace('$', '').replace('.', '')
    # Reemplaza la coma por el punto decimal
    value = value.replace(',', '.')
    return float(value)

class Command(BaseCommand):
    help = 'Importar reservas desde un archivo CSV'

    def add_arguments(self, parser):
        parser.add_argument('csvfile', type=str)

    def handle(self, *args, **options):
        with open(options['csvfile'], newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    habitacion, created = Habitacion.objects.get_or_create(numero=row['Habitación'])

                    fecha_ingreso = datetime.strptime(row['Check-In'], '%d/%m/%Y').date()
                    fecha_egreso = datetime.strptime(row['Check-Out'], '%d/%m/%Y').date()

                    Reserva.objects.create(
                        encargado=row.get('Encargado', 'Desconocido'),
                        nhabitacion=habitacion,
                        nombre=row['Nombre'],
                        apellido=row['Apellido'],
                        personas=int(row['Personas']),
                        fecha_ingreso=fecha_ingreso,
                        fecha_egreso=fecha_egreso,
                        noches=int(row['Noches']),
                        precio_por_noche=parse_float(row['Precio por noche']) if row['Precio por noche'] else 0.0,
                        monto_total=parse_float(row['Monto total']),
                        senia=parse_float(row['Seña']),
                        resto=parse_float(row['Resto']),
                        cantidad_habitaciones=int(row['Cantidad\nde habitaciones']),
                        telefono=row['Telefono'],
                        celiacos=row['Celiacos'].strip().lower() == 'sí',
                        observaciones=row['Observasiones'],
                        origen=row['Origen']
                    )
                    self.stdout.write(self.style.SUCCESS(f"Reserva de {row['Nombre']} {row['Apellido']} importada correctamente."))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error al importar la reserva de {row['Nombre']} {row['Apellido']}: {e}"))
