#!/bin/sh
set -euo pipefail

# Configuración por defecto
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-myproject.settings.production}"
export PYTHONUNBUFFERED=1

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Función para esperar la base de datos (optimizada para Railway)
wait_for_db() {
    log "Esperando conexión a la base de datos..."
    
    # En Railway, las variables de entorno de PostgreSQL vienen con prefijo PG
    DB_HOST="${PGHOST:-${POSTGRES_HOST:-localhost}}"
    DB_PORT="${PGPORT:-${POSTGRES_PORT:-5432}}"
    DB_NAME="${PGDATABASE:-${POSTGRES_DB:-hotel_db}}"
    DB_USER="${PGUSER:-${POSTGRES_USER:-postgres}}"
    DB_PASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD:-}}"
    
    log "Configuración DB: Host=$DB_HOST, Port=$DB_PORT, Database=$DB_NAME, User=$DB_USER"
    
    python - <<'PY'
import os
import time
import socket
import sys

host = os.environ.get('DB_HOST', 'localhost')
port = int(os.environ.get('DB_PORT', '5432'))
max_retries = int(os.environ.get('DB_MAX_RETRIES', '30'))

for attempt in range(max_retries):
    try:
        with socket.create_connection((host, port), timeout=5):
            print(f"✓ Base de datos disponible en {host}:{port}")
            break
    except OSError as e:
        if attempt == max_retries - 1:
            print(f"✗ No se pudo conectar a la base de datos después de {max_retries} intentos")
            print(f"Error: {e}")
            # En Railway, continuar sin base de datos por ahora
            print("⚠️ Continuando sin conexión a base de datos...")
            break
        print(f"⏳ Intento {attempt + 1}/{max_retries}: Base de datos no disponible, esperando...")
        time.sleep(2)
PY
}

# Función para ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones..."
    python manage.py migrate --noinput || {
        log "WARNING: Fallo al ejecutar migraciones - continuando..."
        return 0
    }
    log "✓ Migraciones completadas"
}

# Función para recolectar archivos estáticos
collect_static() {
    log "Recolectando archivos estáticos..."
    
    # Crear directorio staticfiles si no existe y dar permisos
    mkdir -p /app/staticfiles
    chmod -R 755 /app/staticfiles 2>/dev/null || true
    
    # Intentar recolectar archivos estáticos
    python manage.py collectstatic --noinput --clear || {
        log "WARNING: Fallo al recolectar archivos estáticos - continuando sin archivos estáticos"
        return 0
    }
    log "✓ Archivos estáticos recolectados"
}

# Función para crear superusuario si no existe
create_superuser() {
    log "Verificando si existe superusuario..."
    python manage.py crear_supervisor || {
        log "WARNING: Fallo al crear superusuario"
    }
}

# Función para verificar configuración
check_config() {
    log "Verificando configuración de Django..."
    python manage.py check || {
        log "WARNING: Problemas detectados en la configuración"
    }
}

# Función principal
main() {
    log "Iniciando aplicación Django en Railway..."
    
    # Mostrar variables de entorno importantes
    log "DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"
    log "PYTHONUNBUFFERED: $PYTHONUNBUFFERED"
    
    # Esperar base de datos (pero no fallar si no está disponible)
    wait_for_db
    
    # Verificar configuración primero
    check_config
    
    # Ejecutar migraciones
    run_migrations
    
    # Recolectar archivos estáticos
    collect_static
    
    # Crear superusuario si es necesario
    create_superuser
    
    # Iniciar servidor
    log "Iniciando servidor Gunicorn..."
    exec gunicorn myproject.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers ${GUNICORN_WORKERS:-2} \
        --worker-class ${GUNICORN_WORKER_CLASS:-sync} \
        --worker-connections ${GUNICORN_WORKER_CONNECTIONS:-1000} \
        --timeout ${GUNICORN_TIMEOUT:-60} \
        --keep-alive ${GUNICORN_KEEP_ALIVE:-2} \
        --max-requests ${GUNICORN_MAX_REQUESTS:-1000} \
        --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-100} \
        --access-logfile - \
        --error-logfile - \
        --log-level ${GUNICORN_LOG_LEVEL:-info} \
        --preload
}

# Ejecutar función principal
main "$@"
