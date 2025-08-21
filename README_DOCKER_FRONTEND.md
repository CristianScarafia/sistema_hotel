# 🏨 Sistema Hotel - Docker + Frontend React

## 📋 **Descripción**

Sistema completo de gestión hotelera con arquitectura desacoplada:
- **Backend**: Django REST Framework en `localhost:8000`
- **Frontend**: React.js en `localhost:3000`
- **Base de datos**: PostgreSQL en `localhost:5432`

## 🚀 **Inicio Rápido**

### **1. Levantar todo el sistema**
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

### **2. Verificar servicios**
```powershell
docker-compose -f docker-compose.dev.yml ps
```

### **3. Acceder a las aplicaciones**
- **Frontend React**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin/

## 🛠️ **Comandos Útiles**

### **Gestión de Contenedores**
```powershell
# Levantar servicios
docker-compose -f docker-compose.dev.yml up -d

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Reiniciar servicios
docker-compose -f docker-compose.dev.yml restart

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs frontend
docker-compose -f docker-compose.dev.yml logs web
docker-compose -f docker-compose.dev.yml logs db
```

### **Reconstruir Imágenes**
```powershell
# Reconstruir todas las imágenes
docker-compose -f docker-compose.dev.yml build --no-cache

# Reconstruir solo el frontend
docker-compose -f docker-compose.dev.yml build --no-cache frontend

# Reconstruir solo el backend
docker-compose -f docker-compose.dev.yml build --no-cache web
```

### **Comandos Django**
```powershell
# Ejecutar migraciones
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate

# Crear superusuario
docker-compose -f docker-compose.dev.yml exec web python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@hotel.com', 'admin123')
    print('Superusuario creado: admin/admin123')
else:
    print('Superusuario ya existe')
"

# Recolectar archivos estáticos
docker-compose -f docker-compose.dev.yml exec web python manage.py collectstatic --noinput
```

## 📁 **Estructura del Proyecto**

```
sistema_hotel/
├── docker-compose.dev.yml          # Configuración Docker Compose
├── Dockerfile.dev                   # Dockerfile del backend
├── frontend/
│   ├── Dockerfile                   # Dockerfile del frontend
│   ├── package.json                 # Dependencias React
│   ├── public/
│   │   └── index.html              # HTML principal
│   └── src/
│       ├── components/             # Componentes React
│       │   ├── Layout.js           # Layout principal
│       │   ├── Sidebar.js          # Barra lateral
│       │   ├── TopNavbar.js        # Barra superior
│       │   └── ProtectedRoute.js   # Protección de rutas
│       ├── pages/                  # Páginas React
│       │   ├── Dashboard.js        # Dashboard principal
│       │   ├── Login.js            # Página de login
│       │   ├── Reservas.js         # Gestión de reservas
│       │   └── Habitaciones.js     # Gestión de habitaciones
│       ├── context/                # Contextos React
│       │   └── AuthContext.js      # Contexto de autenticación
│       ├── services/               # Servicios API
│       │   └── api.js              # Configuración de axios
│       ├── App.js                  # Componente principal
│       └── index.js                # Punto de entrada
├── myproject/                      # Configuración Django
├── reservas/                       # App principal Django
│   ├── api_views.py               # Vistas de la API
│   ├── api_urls.py                # URLs de la API
│   └── serializers.py             # Serializers DRF
└── scripts/
    └── dev.ps1                    # Script de desarrollo
```

## 🔧 **Configuración**

### **Variables de Entorno**
El sistema usa las siguientes variables de entorno:

```env
# Base de datos
POSTGRES_DB=hotel_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234
DB_PORT=5432

# Django
DJANGO_SETTINGS_MODULE=myproject.settings.development
WEB_PORT=8000

# Frontend
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:8000
```

### **Puertos**
- **3000**: Frontend React
- **8000**: Backend Django
- **5432**: Base de datos PostgreSQL

## 🔐 **Autenticación**

### **Credenciales por Defecto**
- **Usuario**: admin
- **Contraseña**: admin123

### **Crear Nuevo Superusuario**
```powershell
docker-compose -f docker-compose.dev.yml exec web python manage.py createsuperuser
```

## 📊 **API Endpoints**

### **Autenticación**
- `POST /api/auth/` - Login
- `DELETE /api/auth/` - Logout
- `GET /api/auth/` - Obtener usuario actual

### **Reservas**
- `GET /api/reservas/` - Listar reservas
- `POST /api/reservas/` - Crear reserva
- `GET /api/reservas/{id}/` - Obtener reserva
- `PUT /api/reservas/{id}/` - Actualizar reserva
- `DELETE /api/reservas/{id}/` - Eliminar reserva

### **Habitaciones**
- `GET /api/habitaciones/` - Listar habitaciones
- `POST /api/habitaciones/` - Crear habitación
- `GET /api/habitaciones/{id}/` - Obtener habitación
- `PUT /api/habitaciones/{id}/` - Actualizar habitación
- `DELETE /api/habitaciones/{id}/` - Eliminar habitación

### **Estadísticas**
- `GET /api/estadisticas/` - Estadísticas generales
- `GET /api/dashboard/` - Datos del dashboard

## 🎨 **Frontend React**

### **Características**
- **Sidebar** con navegación completa
- **TopNavbar** con información del usuario
- **Rutas protegidas** con autenticación
- **Diseño responsive** con Tailwind CSS
- **Notificaciones** con react-toastify

### **Componentes Principales**
- `Layout`: Layout principal con sidebar
- `Sidebar`: Navegación lateral
- `TopNavbar`: Barra superior
- `ProtectedRoute`: Protección de rutas
- `Dashboard`: Página principal
- `Login`: Página de autenticación

### **Servicios API**
- `AuthContext`: Gestión de autenticación
- `api.js`: Configuración de axios
- `reservasService`: Servicios de reservas
- `habitacionesService`: Servicios de habitaciones
- `estadisticasService`: Servicios de estadísticas

## 🐛 **Solución de Problemas**

### **Frontend no se conecta al Backend**
```powershell
# Verificar que ambos servicios estén corriendo
docker-compose -f docker-compose.dev.yml ps

# Verificar logs del frontend
docker-compose -f docker-compose.dev.yml logs frontend

# Reiniciar el frontend
docker-compose -f docker-compose.dev.yml restart frontend
```

### **Error de Base de Datos**
```powershell
# Verificar estado de la base de datos
docker-compose -f docker-compose.dev.yml logs db

# Reiniciar la base de datos
docker-compose -f docker-compose.dev.yml restart db
```

### **Problemas de Permisos**
```powershell
# Limpiar volúmenes y reconstruir
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

## 📝 **Desarrollo**

### **Modificar Frontend**
Los cambios en el código React se reflejan automáticamente gracias al hot-reload.

### **Modificar Backend**
Los cambios en el código Django se reflejan automáticamente.

### **Agregar Dependencias Frontend**
```powershell
# Entrar al contenedor del frontend
docker-compose -f docker-compose.dev.yml exec frontend sh

# Instalar nueva dependencia
npm install nueva-dependencia

# Salir del contenedor
exit
```

### **Agregar Dependencias Backend**
1. Agregar la dependencia a `requirements.txt`
2. Reconstruir la imagen del backend:
```powershell
docker-compose -f docker-compose.dev.yml build --no-cache web
docker-compose -f docker-compose.dev.yml restart web
```

## 🚀 **Producción**

Para desplegar en producción, se recomienda:
1. Usar `docker-compose.full.yml` (configuración de producción)
2. Configurar variables de entorno de producción
3. Usar un servidor web como Nginx
4. Configurar SSL/TLS
5. Implementar backups de la base de datos

## 📞 **Soporte**

Para problemas o consultas:
1. Verificar los logs: `docker-compose -f docker-compose.dev.yml logs`
2. Verificar el estado de los contenedores: `docker-compose -f docker-compose.dev.yml ps`
3. Revisar la documentación de Django REST Framework y React

---

**¡El sistema está listo para usar!** 🎉
