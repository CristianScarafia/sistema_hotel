#!/bin/sh
set -euo pipefail

# Configuración por defecto
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-myproject.settings.development}"
export PYTHONUNBUFFERED=1

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Función para esperar la base de datos
wait_for_db() {
    log "Esperando conexión a la base de datos..."
    
    python - <<'PY'
import os
import time
import socket
import sys

host = os.environ.get('DB_HOST', 'db')
port = int(os.environ.get('DB_PORT', '5432'))
max_retries = int(os.environ.get('DB_MAX_RETRIES', '60'))

for attempt in range(max_retries):
    try:
        with socket.create_connection((host, port), timeout=5):
            print(f"✓ Base de datos disponible en {host}:{port}")
            break
    except OSError as e:
        if attempt == max_retries - 1:
            print(f"✗ No se pudo conectar a la base de datos después de {max_retries} intentos")
            sys.exit(1)
        print(f"⏳ Intento {attempt + 1}/{max_retries}: Base de datos no disponible, esperando...")
        time.sleep(2)
PY
}

# Función para ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones..."
    python manage.py migrate --noinput || {
        log "ERROR: Fallo al ejecutar migraciones"
        exit 1
    }
    log "✓ Migraciones completadas"
}

# Función para recolectar archivos estáticos
collect_static() {
    log "Recolectando archivos estáticos..."
    
    # Crear directorio staticfiles si no existe y dar permisos
    mkdir -p /app/staticfiles
    chmod -R 755 /app/staticfiles 2>/dev/null || true
    
    # Verificar si hay cambios en archivos estáticos
    if [ "${FORCE_COLLECT_STATIC:-false}" = "true" ] || [ ! -f /app/staticfiles/.collectstatic_done ]; then
        # Intentar recolectar archivos estáticos
        python manage.py collectstatic --noinput --clear || {
            log "WARNING: Fallo al recolectar archivos estáticos - continuando sin archivos estáticos"
            return 0
        }
        # Marcar como completado
        touch /app/staticfiles/.collectstatic_done
        log "✓ Archivos estáticos recolectados"
    else
        log "✓ Archivos estáticos ya recolectados, saltando..."
    fi
}

# Función para crear superusuario si no existe
create_superuser() {
    log "Verificando si existe superusuario..."
    python manage.py crear_supervisor || {
        log "WARNING: Fallo al crear superusuario"
    }
}

# Función principal
main() {
    log "Iniciando aplicación Django..."
    
    # Esperar base de datos
    wait_for_db
    
    # Ejecutar migraciones
    run_migrations
    
    # Recolectar archivos estáticos
    collect_static
    
    # Crear superusuario si es necesario
    create_superuser
    
    # Verificar configuración
    log "Verificando configuración de Django..."
    python manage.py check --deploy || {
        log "WARNING: Problemas detectados en la configuración de despliegue"
    }
    
    # Iniciar servidor
    log "Iniciando servidor Gunicorn..."
    exec gunicorn myproject.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers ${GUNICORN_WORKERS:-3} \
        --worker-class ${GUNICORN_WORKER_CLASS:-sync} \
        --worker-connections ${GUNICORN_WORKER_CONNECTIONS:-1000} \
        --timeout ${GUNICORN_TIMEOUT:-120} \
        --keep-alive ${GUNICORN_KEEP_ALIVE:-2} \
        --max-requests ${GUNICORN_MAX_REQUESTS:-1000} \
        --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-100} \
        --access-logfile - \
        --error-logfile - \
        --log-level ${GUNICORN_LOG_LEVEL:-info}
}

# Ejecutar función principal
main "$@"
