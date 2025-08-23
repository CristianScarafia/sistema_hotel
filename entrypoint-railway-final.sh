#!/bin/sh
set -euo pipefail

# Configuración por defecto
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-myproject.settings.production}"
export PYTHONUNBUFFERED=1

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Función para esperar la base de datos usando DATABASE_URL
wait_for_db() {
    log "Esperando conexión a base de datos..."
    
    # Verificar si tenemos DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        log "❌ ERROR: DATABASE_URL no está configurada"
        log "   Configura la variable DATABASE_URL en Railway"
        return 1
    fi
    
    log "✓ DATABASE_URL configurada: ${DATABASE_URL:0:20}...${DATABASE_URL: -20}"
    
    # Intentar conexión usando el script de diagnóstico
    for i in $(seq 1 10); do
        log "⏳ Intento $i/10: Verificando conexión a PostgreSQL..."
        
        if python diagnose-postgres.py > /dev/null 2>&1; then
            log "✅ Conexión a PostgreSQL exitosa"
            return 0
        else
            log "⏳ Base de datos no disponible, esperando 3 segundos..."
            sleep 3
        fi
    done
    
    log "❌ No se pudo conectar a la base de datos después de 10 intentos"
    log "⚠️ Continuando sin conexión a base de datos..."
    return 1
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
    log "Verificando conexión a base de datos..."
    python test-db-connection.py || {
        log "WARNING: Problemas con la base de datos - continuando"
    }
    
    # Ejecutar migraciones
    run_migrations
    
    # Recolectar archivos estáticos
    collect_static
    
    # Crear superusuario
    create_superuser
    
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
