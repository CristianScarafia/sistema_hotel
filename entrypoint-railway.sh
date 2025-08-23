#!/bin/sh
set -euo pipefail

# Configuración por defecto
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-myproject.settings.production}"
export PYTHONUNBUFFERED=1

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Función para verificar conexión a la base de datos
check_db_connection() {
    log "Verificando conexión a la base de datos..."
    
    # Mostrar configuración actual
    log "Configuración DB: Host=${PGHOST:-NO CONFIGURADO}, Port=${PGPORT:-5432}, Database=${PGDATABASE:-NO CONFIGURADO}, User=${PGUSER:-NO CONFIGURADO}"
    
    # Intentar conexión usando nuestro script simple
    if python test-db-connection.py; then
        log "✅ Conexión a PostgreSQL exitosa"
        return 0
    else
        log "⚠️ Problemas con la conexión a PostgreSQL - continuando"
        return 1
    fi
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
    python manage.py crear_supervisor_simple || {
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
    
    # Verificar conexión a base de datos
    check_db_connection
    
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
