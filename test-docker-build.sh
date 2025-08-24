#!/bin/bash

# Script para probar los Dockerfiles localmente
echo "🧪 Probando builds de Docker..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Probar build del backend
log "Probando build del backend..."
if docker build -f Dockerfile.backend -t hotel-backend-test .; then
    log "✅ Build del backend exitoso"
else
    error "❌ Build del backend falló"
    exit 1
fi

# Probar build del frontend (versión simple)
log "Probando build del frontend (versión simple)..."
if docker build -f frontend/Dockerfile.simple -t hotel-frontend-simple-test ./frontend; then
    log "✅ Build del frontend (simple) exitoso"
else
    error "❌ Build del frontend (simple) falló"
    warning "Intentando versión alternativa..."
    
    # Probar versión alternativa con Node.js
    if docker build -f frontend/Dockerfile.node -t hotel-frontend-node-test ./frontend; then
        log "✅ Build del frontend (Node.js) exitoso"
    else
        error "❌ Build del frontend (Node.js) también falló"
        exit 1
    fi
fi

# Verificar tamaños de las imágenes
log "Verificando tamaños de las imágenes..."
BACKEND_SIZE=$(docker images hotel-backend-test --format "table {{.Size}}" | tail -n 1)
FRONTEND_SIZE=$(docker images hotel-frontend-simple-test --format "table {{.Size}}" | tail -n 1 2>/dev/null || docker images hotel-frontend-node-test --format "table {{.Size}}" | tail -n 1)

log "Tamaño del backend: $BACKEND_SIZE"
log "Tamaño del frontend: $FRONTEND_SIZE"

# Limpiar imágenes de prueba
log "Limpiando imágenes de prueba..."
docker rmi hotel-backend-test 2>/dev/null || true
docker rmi hotel-frontend-simple-test 2>/dev/null || true
docker rmi hotel-frontend-node-test 2>/dev/null || true

log "🎉 Todas las pruebas completadas exitosamente!"
log "Los Dockerfiles están listos para deploy en Railway"
