#!/bin/sh
set -euo pipefail

# Configuración por defecto
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-myproject.settings.production}"
export PYTHONUNBUFFERED=1

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Función principal
main() {
    log "Iniciando aplicación Django en Railway (modo simple)..."
    
    # Mostrar variables de entorno importantes
    log "DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"
    log "PYTHONUNBUFFERED: $PYTHONUNBUFFERED"
    
    # Verificar configuración
    log "Verificando configuración de Django..."
    python manage.py check || {
        log "WARNING: Problemas detectados en la configuración"
    }
    
    # Ejecutar migraciones
    log "Ejecutando migraciones..."
    python manage.py migrate || {
        log "WARNING: Fallo al ejecutar migraciones - continuando"
    }
    
    # Recolectar archivos estáticos (sin fallar)
    log "Recolectando archivos estáticos..."
    mkdir -p /app/staticfiles
    python manage.py collectstatic --noinput --clear || {
        log "WARNING: Fallo al recolectar archivos estáticos - continuando"
    }
    
    # Crear superusuario si no existe
    log "Verificando superusuario..."
    python manage.py crear_supervisor_simple || {
        log "WARNING: Fallo al crear superusuario - continuando"
    }
    
    # Iniciar servidor
    log "Iniciando servidor Gunicorn..."
    exec gunicorn myproject.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers ${GUNICORN_WORKERS:-2} \
        --worker-class ${GUNICORN_WORKER_CLASS:-sync} \
        --timeout ${GUNICORN_TIMEOUT:-30} \
        --keep-alive ${GUNICORN_KEEP_ALIVE:-2} \
        --access-logfile - \
        --error-logfile - \
        --log-level ${GUNICORN_LOG_LEVEL:-info} \
        --preload
}

# Ejecutar función principal
main "$@"
