#!/bin/bash

# Script de inicio para Railway
echo "Starting Django backend..."

# Obtener el puerto desde la variable de entorno
PORT=${PORT:-8000}

# Configurar Django settings
export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-myproject.settings.production}

# Esperar a que la base de datos esté lista (con timeout)
echo "Waiting for database..."
timeout 60 bash -c 'until python manage.py wait_for_db; do sleep 2; done'

# Ejecutar migraciones
echo "Running migrations..."
python manage.py migrate --noinput

# Recolectar archivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Crear superusuario si no existe (opcional)
echo "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Iniciar el servidor
echo "Starting server on port $PORT..."
python manage.py runserver 0.0.0.0:$PORT
