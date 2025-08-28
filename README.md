# Sistema de Hotel

Sistema completo de gestión hotelera con frontend en React y backend en Django, desplegado con Docker.

## 🏗️ Estructura del Proyecto

```
sistema_hotel/
├── backend/                 # Backend Django
│   ├── apps/
│   │   ├── core/           # Aplicación core
│   │   └── reservas/       # Aplicación de reservas
│   ├── myproject/          # Configuración principal de Django
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile.dev
├── frontend/               # Frontend React
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── database/              # Datos de PostgreSQL
├── docker-compose.yml     # Configuración de Docker Compose
└── README.md
```

## 📋 Requisitos

- Docker Desktop
- Docker Compose
- Git

## 🚀 Instalación y Uso

### Opción 1: Docker (Recomendado)

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd sistema_hotel
   ```

2. **Iniciar Docker Desktop:**
   - Asegúrate de que Docker Desktop esté ejecutándose

3. **Iniciar todos los servicios:**
   ```bash
   docker-compose up -d --build
   ```

4. **Verificar que los servicios estén funcionando:**
   ```bash
   docker-compose ps
   ```

5. **Ejecutar migraciones (primera vez):**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

6. **Crear superusuario:**
   ```bash
   docker-compose exec backend python manage.py crear_supervisor_simple
   ```

### Comandos Docker útiles:

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Acceder al shell del backend
docker-compose exec backend sh

# Ejecutar comandos de Django
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic
docker-compose exec backend python manage.py createsuperuser

# Reconstruir imágenes
docker-compose up -d --build

# Limpiar todo
docker-compose down -v --remove-orphans
docker system prune -f
```

### Opción 2: Desarrollo Local

#### Backend (Django)

1. **Navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Crear entorno virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # o
   venv\Scripts\activate     # Windows
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar base de datos:**
   - Crear archivo `.env` basado en `env.example`
   - Configurar variables de entorno

5. **Ejecutar migraciones:**
   ```bash
   python manage.py migrate
   ```

6. **Crear superusuario:**
   ```bash
   python manage.py crear_supervisor_simple
   ```

7. **Iniciar servidor:**
   ```bash
   python manage.py runserver
   ```

#### Frontend (React)

1. **Navegar al directorio frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm start
   ```

## 🌐 Puertos y Servicios

- **Frontend (React):** http://localhost:3000
- **Backend (Django):** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin
- **Base de datos (PostgreSQL):** localhost:5432

## 🗄️ Base de Datos

- **Tipo:** PostgreSQL
- **Nombre:** hotel_db
- **Usuario:** hotel_user
- **Contraseña:** hotel_password
- **Puerto:** 5432

## 📱 Aplicaciones Django

### Core (`apps.core`)
- Funcionalidades básicas del sistema
- Configuraciones centrales

### Reservas (`apps.reservas`)
- Gestión de reservas de habitaciones
- Gestión de habitaciones
- Gestión de usuarios y perfiles
- API REST para el frontend

## 🛠️ Tecnologías Utilizadas

### Backend
- **Django 5.0.6** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de datos
- **psycopg2** - Driver de PostgreSQL
- **Django Debug Toolbar** - Herramientas de desarrollo

### Frontend
- **React 18** - Framework de interfaz
- **Node.js** - Runtime de JavaScript
- **npm** - Gestor de paquetes

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación de servicios
- **Nginx** - Servidor web (en producción)

## 🔧 Configuración de Desarrollo

### Variables de Entorno

Crear archivo `.env` en el directorio raíz:

```env
# Django
DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos
DATABASE_URL=postgresql://hotel_user:hotel_password@db:5432/hotel_db

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### Comandos de Desarrollo

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Acceder al shell del backend
docker-compose exec backend sh

# Ejecutar tests
docker-compose exec backend python manage.py test

# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker-compose exec backend python manage.py migrate

# Recolectar archivos estáticos
docker-compose exec backend python manage.py collectstatic
```

## 🚀 Despliegue

### Producción

1. **Configurar variables de producción:**
   - Crear archivo `.env.production`
   - Configurar `DEBUG=False`
   - Configurar `SECRET_KEY` segura

2. **Construir y desplegar:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa los logs: `docker-compose logs`
2. Verifica el estado de los servicios: `docker-compose ps`
3. Asegúrate de que Docker Desktop esté ejecutándose
4. Revisa que los puertos no estén ocupados

## 📝 Notas

- El sistema está configurado para desarrollo por defecto
- Para producción, usar `docker-compose.prod.yml`
- Los datos de la base de datos se persisten en el volumen `database/`
- El frontend se recarga automáticamente en desarrollo
