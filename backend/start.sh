#!/bin/bash

echo "=== Iniciando backend del sistema hotel ==="

# Esperar a que la base de datos esté lista
echo "Esperando a que la base de datos esté lista..."
python manage.py wait_for_db

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate

# Crear perfiles de usuario por defecto
echo "Creando perfiles de usuario por defecto..."
python manage.py create_default_profiles

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

# Iniciar el servidor
echo "Iniciando servidor Django..."
exec python manage.py runserver 0.0.0.0:8000
