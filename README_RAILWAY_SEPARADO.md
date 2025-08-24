# Deploy Separado en Railway - Sistema de Hotel

Este documento explica cómo hacer deploy del sistema de hotel en Railway con el frontend y backend como servicios separados.

## 📋 Prerrequisitos

- Cuenta en Railway.app
- Git configurado
- Acceso a la base de datos PostgreSQL

## ⚠️ Solución a Problemas de Memoria

Si encuentras errores como `exit code: 137` durante el build, hemos implementado varias soluciones:

### Problemas Comunes:
- **Error 137**: Indica falta de memoria durante el build
- **Context canceled**: Proceso cancelado por Railway
- **Build timeout**: Tiempo de build excedido

### Soluciones Implementadas:

1. **Dockerfiles Optimizados**: 
   - Uso de multi-stage builds
   - Limpieza de dependencias temporales
   - Optimización de caché

2. **Versiones Alternativas**:
   - `Dockerfile.simple`: Versión simplificada del frontend
   - `Dockerfile.node`: Usa Node.js en lugar de nginx

3. **Script de Prueba**: 
   - `test-docker-build.sh`: Prueba los builds localmente

## 🏗️ Estructura del Proyecto

```
sistema_hotel/
├── railway-backend.json          # Configuración Railway para backend
├── railway-backend-variables.env # Variables de entorno backend
├── Dockerfile.backend           # Dockerfile optimizado para backend
├── frontend/
│   ├── railway.json             # Configuración Railway para frontend
│   ├── railway-frontend-variables.env # Variables de entorno frontend
│   ├── Dockerfile.simple        # Dockerfile simplificado
│   ├── Dockerfile.node          # Dockerfile con Node.js
│   └── Dockerfile               # Dockerfile original
└── ...
```

## 🚀 Paso a Paso del Deploy

### 1. Preparar el Repositorio

1. **Crear repositorios separados** (recomendado):
   ```bash
   # Para el backend
   git clone <tu-repo> hotel-backend
   cd hotel-backend
   # Eliminar carpeta frontend
   rm -rf frontend/
   
   # Para el frontend
   git clone <tu-repo> hotel-frontend
   cd hotel-frontend
   # Mantener solo la carpeta frontend
   mv frontend/* .
   rm -rf reservas/ myproject/ apps/ database/ ...
   ```

2. **O usar el mismo repositorio** con diferentes configuraciones:
   - Crear dos servicios en Railway apuntando al mismo repo
   - Usar diferentes archivos de configuración

### 2. Probar Builds Localmente (Recomendado)

```bash
# Dar permisos al script de prueba
chmod +x test-docker-build.sh

# Ejecutar pruebas
./test-docker-build.sh
```

### 3. Deploy del Backend (Django)

1. **Crear nuevo servicio en Railway**:
   - Ir a Railway.app
   - Crear nuevo proyecto
   - Seleccionar "Deploy from GitHub repo"
   - Seleccionar tu repositorio

2. **Configurar el servicio**:
   - **Name**: `hotel-backend`
   - **Root Directory**: `/` (o la raíz del proyecto)
   - **Build Command**: Dejar vacío (usar Dockerfile)
   - **Start Command**: `sh entrypoint-railway-final.sh`

3. **Configurar variables de entorno**:
   ```bash
   # Copiar desde railway-backend-variables.env
   DJANGO_SETTINGS_MODULE=myproject.settings.production
   PYTHONUNBUFFERED=1
   SECRET_KEY=tu-secret-key-super-seguro
   CORS_ALLOW_ALL_ORIGINS=false
   ```

4. **Agregar base de datos PostgreSQL**:
   - En Railway, ir a "New" → "Database" → "PostgreSQL"
   - Railway automáticamente configurará las variables:
     - `DATABASE_URL`
     - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

5. **Deploy**:
   - Railway detectará automáticamente el `railway-backend.json`
   - Usará `Dockerfile.backend` para construir la imagen
   - El servicio estará disponible en: `https://hotel-backend-xxx.up.railway.app`

### 4. Deploy del Frontend (React)

1. **Crear nuevo servicio en Railway**:
   - En el mismo proyecto, crear "New Service"
   - Seleccionar "Deploy from GitHub repo"
   - Seleccionar tu repositorio

2. **Configurar el servicio**:
   - **Name**: `hotel-frontend`
   - **Root Directory**: `/frontend` (o la carpeta del frontend)
   - **Build Command**: Dejar vacío (usar Dockerfile)
   - **Start Command**: `/start.sh`

3. **Configurar variables de entorno**:
   ```bash
   # Copiar desde railway-frontend-variables.env
   NODE_ENV=production
   REACT_APP_API_URL=https://hotel-backend-xxx.up.railway.app/api
   PORT=8080
   GENERATE_SOURCEMAP=false
   ```

4. **Deploy**:
   - Railway detectará automáticamente el `railway.json` en la carpeta frontend
   - Usará `Dockerfile.simple` para construir la imagen
   - El servicio estará disponible en: `https://hotel-frontend-xxx.up.railway.app`

### 5. Configurar Comunicación entre Servicios

1. **Actualizar CORS en el backend**:
   - En las variables de entorno del backend, agregar:
   ```bash
   CORS_ALLOWED_ORIGINS=https://hotel-frontend-xxx.up.railway.app
   ```

2. **Actualizar URL del API en el frontend**:
   - En las variables de entorno del frontend, actualizar:
   ```bash
   REACT_APP_API_URL=https://hotel-backend-xxx.up.railway.app/api
   ```

3. **Redeploy ambos servicios** para aplicar los cambios

## 🔧 Configuración Detallada

### Variables de Entorno del Backend

```bash
# Django
DJANGO_SETTINGS_MODULE=myproject.settings.production
PYTHONUNBUFFERED=1
SECRET_KEY=tu-secret-key-super-seguro

# Gunicorn
GUNICORN_WORKERS=2
GUNICORN_TIMEOUT=60
GUNICORN_LOG_LEVEL=info

# CORS
CORS_ALLOWED_ORIGINS=https://hotel-frontend-xxx.up.railway.app
CORS_ALLOW_CREDENTIALS=true

# Base de datos (Railway las proporciona automáticamente)
# DATABASE_URL, PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
```

### Variables de Entorno del Frontend

```bash
# React
NODE_ENV=production
REACT_APP_API_URL=https://hotel-backend-xxx.up.railway.app/api
PORT=8080
GENERATE_SOURCEMAP=false
CI=false
```

## 🧪 Verificación del Deploy

### 1. Verificar Backend

```bash
# Health check
curl https://hotel-backend-xxx.up.railway.app/health/

# Respuesta esperada:
{
  "status": "healthy",
  "service": "hotel-backend",
  "message": "Service is running",
  "timestamp": 1234567890
}
```

### 2. Verificar Frontend

```bash
# Verificar que carga correctamente
curl https://hotel-frontend-xxx.up.railway.app/

# Debería devolver el HTML de la aplicación React
```

### 3. Verificar Comunicación

1. Abrir el frontend en el navegador
2. Intentar hacer login
3. Verificar que las llamadas al API funcionan
4. Revisar la consola del navegador para errores

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error de CORS**:
   - Verificar que `CORS_ALLOWED_ORIGINS` incluya la URL del frontend
   - Asegurar que `CORS_ALLOW_CREDENTIALS=true`

2. **Error de conexión al API**:
   - Verificar que `REACT_APP_API_URL` apunte a la URL correcta del backend
   - Asegurar que el backend esté funcionando

3. **Error de base de datos**:
   - Verificar que las variables de PostgreSQL estén configuradas
   - Revisar los logs del backend en Railway

4. **Error de build (137)**:
   - Usar `Dockerfile.simple` en lugar del original
   - Verificar que no haya dependencias innecesarias
   - Revisar los logs de build en Railway

5. **Error de memoria durante build**:
   - Usar la versión `Dockerfile.node` del frontend
   - Reducir el número de workers de Gunicorn
   - Optimizar las dependencias

### Comandos Útiles

```bash
# Ver logs del backend
railway logs --service hotel-backend

# Ver logs del frontend
railway logs --service hotel-frontend

# Ejecutar comando en el backend
railway run --service hotel-backend python manage.py migrate

# Ver variables de entorno
railway variables --service hotel-backend

# Probar builds localmente
./test-docker-build.sh
```

## 📊 Monitoreo

1. **Health Checks**: Ambos servicios tienen health checks configurados
2. **Logs**: Revisar logs regularmente en Railway
3. **Métricas**: Railway proporciona métricas básicas de uso

## 🔄 Actualizaciones

Para actualizar el código:

1. **Push al repositorio**:
   ```bash
   git add .
   git commit -m "Update"
   git push origin main
   ```

2. **Railway automáticamente**:
   - Detectará los cambios
   - Reconstruirá las imágenes
   - Redeployará los servicios

## 🎯 URLs Finales

- **Frontend**: `https://hotel-frontend-xxx.up.railway.app`
- **Backend API**: `https://hotel-backend-xxx.up.railway.app/api`
- **Admin Django**: `https://hotel-backend-xxx.up.railway.app/admin`

## 📝 Notas Importantes

1. **Costos**: Railway cobra por uso, revisar la documentación de precios
2. **Límites**: Railway tiene límites en el plan gratuito
3. **Backup**: Configurar backups de la base de datos
4. **Dominio**: Se puede configurar un dominio personalizado
5. **SSL**: Railway proporciona SSL automáticamente
6. **Memoria**: Los builds optimizados reducen el uso de memoria

## 🆘 Soporte

- **Railway Docs**: https://docs.railway.app/
- **Django Docs**: https://docs.djangoproject.com/
- **React Docs**: https://reactjs.org/docs/
- **Docker Docs**: https://docs.docker.com/
