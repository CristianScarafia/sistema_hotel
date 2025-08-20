#!/bin/bash

# Script de desarrollo para automatizar tareas comunes
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    echo "Script de desarrollo para el sistema de hotel"
    echo ""
    echo "Uso: ./scripts/dev.sh [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start          - Iniciar todos los servicios"
    echo "  stop           - Detener todos los servicios"
    echo "  restart        - Reiniciar todos los servicios"
    echo "  build          - Reconstruir imágenes Docker"
    echo "  logs           - Mostrar logs de los servicios"
    echo "  shell          - Abrir shell en el contenedor web"
    echo "  migrate        - Ejecutar migraciones"
    echo "  collectstatic  - Recolectar archivos estáticos"
    echo "  superuser      - Crear superusuario"
    echo "  clean          - Limpiar contenedores y volúmenes"
    echo "  help           - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh collectstatic"
    echo "  ./scripts/dev.sh shell"
}

# Función para iniciar servicios
start_services() {
    log "Iniciando servicios..."
    docker-compose -f docker-compose.dev.yml up -d
    success "Servicios iniciados"
}

# Función para detener servicios
stop_services() {
    log "Deteniendo servicios..."
    docker-compose -f docker-compose.dev.yml down
    success "Servicios detenidos"
}

# Función para reiniciar servicios
restart_services() {
    log "Reiniciando servicios..."
    docker-compose -f docker-compose.dev.yml restart
    success "Servicios reiniciados"
}

# Función para construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    docker-compose -f docker-compose.dev.yml build --no-cache
    success "Imágenes construidas"
}

# Función para mostrar logs
show_logs() {
    log "Mostrando logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Función para abrir shell
open_shell() {
    log "Abriendo shell en el contenedor web..."
    docker-compose -f docker-compose.dev.yml exec web sh
}

# Función para ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones..."
    docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
    success "Migraciones completadas"
}

# Función para recolectar archivos estáticos
collect_static_files() {
    log "Recolectando archivos estáticos..."
    docker-compose -f docker-compose.dev.yml exec web python manage.py collectstatic --noinput
    success "Archivos estáticos recolectados"
}

# Función para crear superusuario
create_superuser() {
    log "Creando superusuario..."
    docker-compose -f docker-compose.dev.yml exec web python manage.py crear_supervisor
    success "Superusuario creado"
}

# Función para limpiar
clean_all() {
    warning "Esta acción eliminará todos los contenedores y volúmenes. ¿Estás seguro? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log "Limpiando contenedores y volúmenes..."
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        success "Limpieza completada"
    else
        log "Limpieza cancelada"
    fi
}

# Función principal
main() {
    case "${1:-help}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        build)
            build_images
            ;;
        logs)
            show_logs
            ;;
        shell)
            open_shell
            ;;
        migrate)
            run_migrations
            ;;
        collectstatic)
            collect_static_files
            ;;
        superuser)
            create_superuser
            ;;
        clean)
            clean_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Comando desconocido: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
