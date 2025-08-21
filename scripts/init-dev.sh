#!/bin/bash

# Script de inicialización para desarrollo
# Este script facilita el setup inicial del proyecto

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Inicializando proyecto de desarrollo...${NC}"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado. Por favor instala Docker primero.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado. Por favor instala Docker Compose primero.${NC}"
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado. Creando archivo .env por defecto...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Archivo .env creado desde env.example${NC}"
fi

# Construir y levantar los contenedores
echo -e "${YELLOW}🔨 Construyendo contenedores...${NC}"
docker-compose -f docker-compose.dev.yml build

echo -e "${YELLOW}🚀 Levantando servicios...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar que los contenedores estén funcionando
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo -e "${RED}❌ Los contenedores no están funcionando correctamente.${NC}"
    echo -e "${YELLOW}📋 Logs de los contenedores:${NC}"
    docker-compose -f docker-compose.dev.yml logs
    exit 1
fi

echo -e "${GREEN}✅ Servicios levantados correctamente${NC}"

# Mostrar información de acceso
echo -e "${GREEN}🎉 ¡Proyecto inicializado correctamente!${NC}"
echo -e "${YELLOW}📋 Información de acceso:${NC}"
echo -e "  🌐 Aplicación web: http://localhost:8000"
echo -e "  🗄️  Base de datos: localhost:5432"
echo -e "  👤 Usuario por defecto: admin"
echo -e "  🔑 Contraseña por defecto: admin123"
echo -e ""
echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
echo -e "  📊 Ver logs: make dev-logs"
echo -e "  🐚 Acceder al shell: make dev-shell"
echo -e "  🗄️  Acceder a la base de datos: make dev-db-shell"
echo -e "  📦 Crear superusuario: make dev-createsuperuser"
echo -e "  🛑 Detener servicios: make dev-down"
echo -e ""
echo -e "${GREEN}🎯 ¡Listo para desarrollar!${NC}"
