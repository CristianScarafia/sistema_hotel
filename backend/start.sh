#!/bin/bash

# Script de inicio para Railway
echo "Starting Django backend..."

# Obtener el puerto desde la variable de entorno
PORT=${PORT:-8000}

# Configurar Django settings
export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-myproject.settings.production}

# Esperar a que la base de datos esté lista (con timeout)
echo "Waiting for database..."
timeout 60 bash -c 'until python manage.py wait_for_db; do sleep 2; done' || echo "Database connection timeout, continuing anyway..."

# Ejecutar migraciones
echo "Running migrations..."
python manage.py migrate --noinput

# Recolectar archivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Crear superusuario si no existe
echo "Creating superuser with all permissions..."
python manage.py create_superuser

# Asignar permisos de supervisor al usuario admin (por si ya existía)
echo "Assigning supervisor permissions..."
python manage.py assign_supervisor_permissions --username admin

# Iniciar el servidor
echo "Starting server on port $PORT..."
python manage.py runserver 0.0.0.0:$PORT
