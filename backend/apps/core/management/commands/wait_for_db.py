import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    help = 'Esperar a que la base de datos esté lista'

    def handle(self, *args, **options):
        self.stdout.write('Esperando a que la base de datos esté lista...')
        
        db_conn = None
        while not db_conn:
            try:
                db_conn = connections['default']
                db_conn.cursor()
                self.stdout.write(self.style.SUCCESS('Base de datos lista!'))
            except OperationalError:
                self.stdout.write('Base de datos no disponible, esperando 1 segundo...')
                time.sleep(1)