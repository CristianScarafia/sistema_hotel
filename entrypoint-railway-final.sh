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
    python manage.py migrate || {
        log "WARNING: Fallo al ejecutar migraciones - continuando"
    }
}

# Función para recolectar archivos estáticos
collect_static() {
    log "Recolectando archivos estáticos..."
    mkdir -p /app/staticfiles
    python manage.py collectstatic --noinput --clear || {
        log "WARNING: Fallo al recolectar archivos estáticos - continuando"
    }
}

# Función para crear superusuario
create_superuser() {
    log "Verificando superusuario..."
    python manage.py crear_supervisor_simple || {
        log "WARNING: Fallo al crear superusuario - continuando"
    }
}

# Función para verificar que Gunicorn esté funcionando
wait_for_gunicorn() {
    log "Esperando a que Gunicorn esté funcionando..."
    
    for i in $(seq 1 30); do
        if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
            log "✅ Gunicorn está funcionando correctamente"
            return 0
        fi
        log "⏳ Intento $i/30: Gunicorn no está listo, esperando 2 segundos..."
        sleep 2
    done
    
    log "❌ Gunicorn no se pudo verificar después de 30 intentos"
    return 1
}

# Función principal
main() {
    log "Iniciando aplicación Django en Railway (configuración final)..."
    
    # Mostrar variables de entorno importantes
    log "DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"
    log "PYTHONUNBUFFERED: $PYTHONUNBUFFERED"
    
    # Verificar configuración de Django
    log "Verificando configuración de Django..."
    python manage.py check || {
        log "WARNING: Problemas detectados en la configuración"
    }
    
    # Verificar conexión a base de datos
    check_db_connection
    
    # Ejecutar migraciones
    run_migrations
    
    # Recolectar archivos estáticos
    collect_static
    
    # Crear superusuario
    create_superuser
    
    # Iniciar servidor en background
    log "Iniciando servidor Gunicorn..."
    gunicorn myproject.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers ${GUNICORN_WORKERS:-2} \
        --worker-class ${GUNICORN_WORKER_CLASS:-sync} \
        --timeout ${GUNICORN_TIMEOUT:-30} \
        --keep-alive ${GUNICORN_KEEP_ALIVE:-2} \
        --access-logfile - \
        --error-logfile - \
        --log-level ${GUNICORN_LOG_LEVEL:-info} \
        --preload &
    
    GUNICORN_PID=$!
    
    # Esperar a que Gunicorn esté funcionando
    wait_for_gunicorn
    
    # Mantener el proceso activo
    log "✅ Servicio iniciado correctamente. PID: $GUNICORN_PID"
    wait $GUNICORN_PID
}

# Ejecutar función principal
main "$@"
