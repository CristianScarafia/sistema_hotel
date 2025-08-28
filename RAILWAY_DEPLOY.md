# Deploy en Railway - Sistema de Hotel

## Configuración Actual

✅ **Configuración apta para Railway:**
- Frontend con nginx como servidor web principal
- Dockerfile de producción optimizado
- Configuración de puertos dinámica
- Health checks configurados

## Paso a Paso para Deploy en Railway

### 1. Preparación del Repositorio

Asegúrate de que tu repositorio contenga:
- `frontend/Dockerfile.prod` - Dockerfile de producción
- `railway.json` - Configuración de Railway
- `frontend/start.sh` - Script de inicio
- `frontend/nginx.conf.template` - Template de nginx

### 2. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta tu repositorio de GitHub

### 3. Configurar Variables de Entorno

En Railway, ve a la pestaña "Variables" y configura:

```env
# Variables del frontend
REACT_APP_API_URL=https://tu-backend-url.com/api

# Variables de Railway (automáticas)
PORT=8080
```

#### **Ejemplos de REACT_APP_API_URL:**

**Si usas Railway para el backend:**
```env
REACT_APP_API_URL=https://tu-backend-railway.up.railway.app/api
```

**Si usas Heroku para el backend:**
```env
REACT_APP_API_URL=https://tu-app-heroku.herokuapp.com/api
```

**Si usas DigitalOcean para el backend:**
```env
REACT_APP_API_URL=https://tu-droplet-ip.com/api
```

**Para desarrollo local:**
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Configurar el Deploy

1. En Railway, ve a "Settings" del servicio
2. Asegúrate de que:
   - **Root Directory**: `/` (raíz del proyecto)
   - **Dockerfile Path**: `frontend/Dockerfile.prod`
   - **Port**: `8080`

### 5. Deploy Automático

Railway detectará automáticamente:
- El Dockerfile de producción
- La configuración de nginx
- El puerto expuesto (8080)

### 6. Verificar el Deploy

1. Railway asignará una URL automáticamente
2. El frontend estará disponible en esa URL
3. Nginx servirá los archivos estáticos de React

## Estructura del Deploy

```
Railway URL → Nginx (puerto 8080) → React App (archivos estáticos)
```

## Desplegar el Backend en Railway

### Configuración del Backend

Para desplegar el backend en Railway, necesitas:

1. **Crear un segundo servicio** en Railway para el backend
2. **Configurar las variables de entorno** necesarias
3. **Usar el Dockerfile de producción** del backend

### Variables de Entorno para el Backend

```env
# Configuración de Django
DEBUG=0
DJANGO_SETTINGS_MODULE=myproject.settings.production
SECRET_KEY=tu-secret-key-super-segura
ALLOWED_HOSTS=*

# Base de datos (Railway te proporciona esto automáticamente)
DATABASE_URL=postgresql://user:password@host:port/database

# Variables de Railway (automáticas)
PORT=8000
```

### Pasos para el Backend

1. **En Railway, crea un nuevo servicio**
2. **Configura el Root Directory:** `backend/`
3. **Configura el Dockerfile Path:** `Dockerfile.prod`
4. **Agrega las variables de entorno** mencionadas arriba
5. **Railway detectará automáticamente** la configuración

## Notas Importantes

✅ **Ahora puedes desplegar tanto frontend como backend en Railway**

🔧 **API URL:** Una vez desplegado el backend, actualiza `REACT_APP_API_URL` en el frontend con la URL del backend de Railway.

## Troubleshooting

### Error: "Port not exposed"
- Verifica que el Dockerfile exponga el puerto 8080
- Asegúrate de que nginx escuche en el puerto correcto

### Error: "Build failed"
- Revisa los logs de build en Railway
- Verifica que todas las dependencias estén en package.json

### Error: "Health check failed"
- Verifica que nginx esté respondiendo en el puerto correcto
- Revisa los logs del contenedor en Railway
