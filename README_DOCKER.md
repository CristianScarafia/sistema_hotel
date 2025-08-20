# 🐳 Configuración Docker - Sistema Hotel

Esta documentación describe la configuración Docker optimizada para el Sistema de Gestión Hotelera.

## 📋 Requisitos Previos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (opcional, para usar comandos simplificados)

## 🚀 Inicio Rápido

### 1. Configuración Inicial

```bash
# Copiar archivo de variables de entorno
cp env.example .env

# Editar variables según tu entorno
nano .env
```

### 2. Desarrollo

```bash
# Usando Make (recomendado)
make dev

# O usando Docker Compose directamente
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Producción

```bash
# Usando Make
make deploy

# O usando Docker Compose directamente
docker-compose up -d
```

## 🛠️ Comandos Útiles

### Con Make (Recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Desarrollo
make dev          # Iniciar entorno de desarrollo
make dev-shell    # Acceder al shell del contenedor
make dev-logs     # Ver logs de desarrollo

# Producción
make up           # Levantar servicios
make down         # Detener servicios
make logs         # Ver logs
make restart      # Reiniciar servicios

# Django
make migrate      # Ejecutar migraciones
make shell        # Shell de Django
make collectstatic # Recolectar estáticos

# Base de datos
make db-shell     # Shell de PostgreSQL
make db-backup    # Crear backup
make db-restore   # Restaurar backup

# Limpieza
make clean        # Limpiar recursos no utilizados
make clean-all    # Limpiar todo (¡CUIDADO!)
```

### Sin Make

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f

# Producción
docker-compose up -d
docker-compose logs -f

# Django
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py shell
```

## 🏗️ Arquitectura

### Servicios Principales

1. **web** - Aplicación Django
   - Imagen: Multi-stage build optimizada
   - Usuario: No-root (django:1000)
   - Healthcheck: Verificación de Django

2. **db** - Base de datos PostgreSQL
   - Imagen: postgres:14.3-alpine3.16
   - Healthcheck: pg_isready
   - Volumen persistente

3. **nginx** - Servidor web (producción)
   - Imagen: nginx:alpine
   - SSL/TLS configurable
   - Proxy reverso

4. **redis** - Caché (opcional)
   - Imagen: redis:7-alpine
   - Persistencia configurable

### Redes

- **hotel_network**: Red principal para producción
- **hotel_network_dev**: Red para desarrollo

### Volúmenes

- **db_data**: Datos de PostgreSQL
- **static_volume**: Archivos estáticos
- **media_volume**: Archivos de media
- **redis_data**: Datos de Redis

## 🔧 Configuración

### Variables de Entorno

Edita el archivo `.env` con tus valores:

```bash
# Django
DJANGO_SETTINGS_MODULE=myproject.settings.development
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True

# Base de datos
DB_HOST=db
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=tu-password

# Puertos
WEB_PORT=8000
DB_PORT=5432
```

### Configuración de Gunicorn

```bash
# En .env
GUNICORN_WORKERS=3
GUNICORN_TIMEOUT=120
GUNICORN_LOG_LEVEL=info
```

## 📊 Monitoreo

### Healthchecks

- **Django**: `python manage.py check`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

### Logs

```bash
# Ver logs en tiempo real
make logs

# Ver logs de un servicio específico
docker-compose logs -f web
docker-compose logs -f db
```

### Estadísticas

```bash
# Uso de recursos
make stats

# Estado de contenedores
make status
```

## 🔒 Seguridad

### Características Implementadas

1. **Usuario no-root**: La aplicación corre como usuario `django:1000`
2. **Multi-stage build**: Reduce el tamaño de la imagen final
3. **Healthchecks**: Verificación de estado de servicios
4. **Variables de entorno**: Configuración segura
5. **Redes aisladas**: Comunicación entre servicios

### Recomendaciones de Producción

1. **Cambiar contraseñas por defecto**
2. **Usar certificados SSL válidos**
3. **Configurar backups automáticos**
4. **Monitorear logs regularmente**
5. **Actualizar imágenes regularmente**

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. Error de conexión a la base de datos

```bash
# Verificar estado de la BD
make status

# Ver logs de la BD
docker-compose logs db

# Reiniciar servicios
make restart
```

#### 2. Error de permisos

```bash
# Verificar permisos del usuario
docker-compose exec web id

# Corregir permisos si es necesario
docker-compose exec web chown -R django:django /app
```

#### 3. Problemas de memoria

```bash
# Ver uso de recursos
make stats

# Ajustar límites en docker-compose.yml
```

### Logs de Debug

```bash
# Ver logs detallados
docker-compose logs -f --tail=100

# Ver logs de un servicio específico
docker-compose logs web --tail=50
```

## 📈 Optimización

### Rendimiento

1. **Multi-stage build**: Reduce tamaño de imagen
2. **Caché de pip**: Acelera builds
3. **Volúmenes nombrados**: Mejor rendimiento
4. **Healthchecks**: Inicio más rápido

### Recursos

```yaml
# Límites de memoria (en docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

## 🔄 Actualizaciones

### Actualizar Imágenes

```bash
# Reconstruir con imágenes más recientes
make redeploy

# O manualmente
docker-compose pull
docker-compose build --no-cache
docker-compose up -d
```

### Migraciones de Base de Datos

```bash
# Crear migraciones
docker-compose exec web python manage.py makemigrations

# Aplicar migraciones
make migrate
```

## 📚 Referencias

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Django Deployment](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)
