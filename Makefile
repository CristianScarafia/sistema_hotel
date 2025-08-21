.PHONY: help build up down logs shell migrate collectstatic test clean

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Mostrar esta ayuda
	@echo "$(GREEN)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

# ===== COMANDOS DE PRODUCCIÓN =====

build: ## Construir imágenes de Docker
	docker-compose -f $(COMPOSE_FILE) build

up: ## Levantar servicios de producción
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Detener servicios de producción
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Reiniciar servicios de producción
	docker-compose -f $(COMPOSE_FILE) restart

logs: ## Ver logs de producción
	docker-compose -f $(COMPOSE_FILE) logs -f

# ===== COMANDOS DE DESARROLLO =====

dev-build: ## Construir imágenes de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) build

dev-up: ## Levantar servicios de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) up -d

dev-down: ## Detener servicios de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) down

dev-logs: ## Ver logs de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

dev-shell: ## Acceder al shell del contenedor de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) exec web sh

# ===== COMANDOS DE DJANGO =====

shell: ## Acceder al shell de Django
	docker-compose -f $(COMPOSE_FILE) exec web python manage.py shell

migrate: ## Ejecutar migraciones
	docker-compose -f $(COMPOSE_FILE) exec web python manage.py migrate

makemigrations: ## Crear migraciones
	docker-compose -f $(COMPOSE_FILE) exec web python manage.py makemigrations

collectstatic: ## Recolectar archivos estáticos
	docker-compose -f $(COMPOSE_FILE) exec web python manage.py collectstatic --noinput

dev-collectstatic: ## Recolectar archivos estáticos (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec web python manage.py collectstatic --noinput

createsuperuser: ## Crear superusuario
	docker-compose -f $(COMPOSE_FILE) exec web python manage.py crear_supervisor

dev-createsuperuser: ## Crear superusuario (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec web python manage.py crear_supervisor

dev-migrate: ## Ejecutar migraciones (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec web python manage.py migrate

dev-makemigrations: ## Crear migraciones (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec web python manage.py makemigrations

dev-shell: ## Acceder al shell de Django (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec web python manage.py shell

# ===== COMANDOS DE BASE DE DATOS =====

db-shell: ## Acceder al shell de PostgreSQL
	docker-compose -f $(COMPOSE_FILE) exec db psql -U postgres -d hotel_db

db-backup: ## Crear backup de la base de datos
	docker-compose -f $(COMPOSE_FILE) exec db pg_dump -U postgres hotel_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restaurar backup de la base de datos (especificar archivo con BACKUP_FILE=archivo.sql)
	docker-compose -f $(COMPOSE_FILE) exec -T db psql -U postgres hotel_db < $(BACKUP_FILE)

dev-db-shell: ## Acceder al shell de PostgreSQL (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec db psql -U postgres -d hotel_db

dev-db-backup: ## Crear backup de la base de datos (desarrollo)
	docker-compose -f $(COMPOSE_DEV_FILE) exec db pg_dump -U postgres hotel_db > backup_dev_$(shell date +%Y%m%d_%H%M%S).sql

dev-db-restore: ## Restaurar backup de la base de datos (desarrollo) (especificar archivo con BACKUP_FILE=archivo.sql)
	docker-compose -f $(COMPOSE_DEV_FILE) exec -T db psql -U postgres hotel_db < $(BACKUP_FILE)

dev-db-reset: ## Resetear base de datos de desarrollo (¡CUIDADO! Esto elimina todos los datos)
	docker-compose -f $(COMPOSE_DEV_FILE) down
	docker volume rm sistema_hotel_db_data || true
	docker-compose -f $(COMPOSE_DEV_FILE) up -d

init-dev: ## Inicializar proyecto de desarrollo (setup completo)
	@echo "$(GREEN)🚀 Inicializando proyecto de desarrollo...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  Archivo .env no encontrado. Creando archivo .env por defecto...$(NC)"; \
		cp env.example .env; \
		echo "$(GREEN)✅ Archivo .env creado desde env.example$(NC)"; \
	fi
	docker-compose -f $(COMPOSE_DEV_FILE) build
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "$(GREEN)✅ Proyecto inicializado correctamente$(NC)"
	@echo "$(YELLOW)📋 Información de acceso:$(NC)"
	@echo "  🌐 Aplicación web: http://localhost:8000"
	@echo "  👤 Usuario por defecto: admin"
	@echo "  🔑 Contraseña por defecto: admin123"

# ===== COMANDOS DE LIMPIEZA =====

clean: ## Limpiar contenedores, imágenes y volúmenes no utilizados
	docker system prune -f
	docker volume prune -f

clean-all: ## Limpiar todo (¡CUIDADO! Esto elimina todos los datos)
	docker-compose -f $(COMPOSE_FILE) down -v
	docker-compose -f $(COMPOSE_DEV_FILE) down -v
	docker system prune -a -f
	docker volume prune -f

# ===== COMANDOS DE MONITOREO =====

status: ## Mostrar estado de los contenedores
	docker-compose -f $(COMPOSE_FILE) ps

stats: ## Mostrar estadísticas de uso de recursos
	docker stats

# ===== COMANDOS DE DESPLIEGUE =====

deploy: build up ## Desplegar aplicación (build + up)

redeploy: down build up ## Redesplegar aplicación (down + build + up)

# ===== COMANDOS DE DESARROLLO RÁPIDO =====

dev: dev-up dev-logs ## Iniciar entorno de desarrollo con logs

quick-test: ## Ejecutar tests rápidos
	docker-compose -f $(COMPOSE_FILE) exec web python manage.py test

# ===== COMANDOS DE UTILIDAD =====

env-copy: ## Copiar archivo de ejemplo de variables de entorno
	cp env.example .env
	@echo "$(GREEN)Archivo .env creado desde env.example$(NC)"
	@echo "$(YELLOW)Recuerda editar .env con tus valores específicos$(NC)"

setup: env-copy dev-up ## Configuración inicial completa
	@echo "$(GREEN)Configuración inicial completada$(NC)"
	@echo "$(YELLOW)La aplicación está disponible en http://localhost:8000$(NC)"
