# Deploy en Railway - Sistema de Hotel

## 🚀 Configuración para Railway

Este proyecto está optimizado para desplegarse en Railway con las siguientes características:

- **Backend Django** con PostgreSQL
- **Frontend React** separado
- **Health checks** automáticos
- **Variables de entorno** configuradas
- **Docker** optimizado

## 📋 Pasos para Deploy

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio contenga todos los archivos necesarios:

```bash
# Archivos de configuración de Railway
railway.json
railway.toml
entrypoint-railway.sh
railway-variables.env

# Archivos de configuración de Django
myproject/settings/production.py

# Archivos de configuración del frontend
frontend/railway.json
frontend/.railwayignore
```

### 2. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta tu repositorio

### 3. Configurar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway te proporcionará automáticamente las variables de entorno:
   - `PGHOST`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGPORT`

### 4. Configurar Servicio Backend (Django)

1. En tu proyecto de Railway, haz clic en "New Service"
2. Selecciona "GitHub Repo"
3. Conecta tu repositorio
4. Railway detectará automáticamente el `Dockerfile`

#### Variables de Entorno para el Backend:

```env
# Configuración de Django
DJANGO_SETTINGS_MODULE=myproject.settings.production
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# Configuración de Gunicorn
GUNICORN_WORKERS=2
GUNICORN_WORKER_CLASS=sync
GUNICORN_TIMEOUT=60
GUNICORN_LOG_LEVEL=info

# Configuración de seguridad
SECRET_KEY=tu-secret-key-aqui

# Configuración de archivos estáticos
FORCE_COLLECT_STATIC=true

# Configuración de base de datos (Railway las proporciona automáticamente)
# PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT
```

### 5. Configurar Servicio Frontend (React)

1. En tu proyecto de Railway, haz clic en "New Service"
2. Selecciona "GitHub Repo"
3. Conecta tu repositorio
4. Especifica el directorio: `frontend`

#### Variables de Entorno para el Frontend:

```env
REACT_APP_API_URL=https://tu-backend-url.railway.app
PORT=3000
NODE_ENV=production
```

### 6. Generar SECRET_KEY

Ejecuta este comando para generar una SECRET_KEY segura:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copia la clave generada y agrégala como variable de entorno `SECRET_KEY` en Railway.

### 7. Configurar Dominios

1. **Backend**: Ve a Settings → Domains en tu servicio Django
2. **Frontend**: Ve a Settings → Domains en tu servicio React
3. Actualiza `CSRF_TRUSTED_ORIGINS` en `production.py` con tu URL de Railway

### 8. Verificar el Deploy

1. **Health Check**: Visita `https://tu-backend-url.railway.app/health/`
2. **Admin**: Visita `https://tu-backend-url.railway.app/admin/`
3. **Frontend**: Visita `https://tu-frontend-url.railway.app`

## 🔧 Solución de Problemas

### Health Check Falla

Si el health check falla, verifica:

1. **Variables de entorno**: Asegúrate de que todas las variables estén configuradas
2. **Base de datos**: Verifica que PostgreSQL esté funcionando
3. **Logs**: Revisa los logs del servicio en Railway

### Error de Conexión a Base de Datos

1. Verifica que las variables `PGHOST`, `PGDATABASE`, etc. estén configuradas
2. Asegúrate de que el servicio PostgreSQL esté funcionando
3. Revisa los logs del servicio Django

### Error de Archivos Estáticos

1. Verifica que `FORCE_COLLECT_STATIC=true` esté configurado
2. Revisa los logs para ver si hay errores en `collectstatic`

## 📊 Monitoreo

### Logs

- Ve a tu servicio en Railway
- Haz clic en "Logs" para ver los logs en tiempo real
- Los logs incluyen información de Gunicorn y Django

### Métricas

- Railway proporciona métricas básicas de CPU y memoria
- Puedes configurar alertas en la configuración del proyecto

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz push de los cambios a tu repositorio de GitHub
2. Railway detectará automáticamente los cambios
3. Iniciará un nuevo deploy automáticamente

## 🛡️ Seguridad

### Variables de Entorno

- Nunca commits archivos `.env` al repositorio
- Usa variables de entorno de Railway para información sensible
- Rota regularmente las claves secretas

### Configuración de Django

- `DEBUG=False` en producción
- `ALLOWED_HOSTS` configurado correctamente
- `CSRF_TRUSTED_ORIGINS` actualizado con tu dominio

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servicio
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de Railway
4. Revisa este README para soluciones comunes

## 🎯 Próximos Pasos

Una vez que el deploy esté funcionando:

1. Configura un dominio personalizado
2. Configura SSL/HTTPS
3. Configura backups de la base de datos
4. Configura monitoreo y alertas
5. Optimiza el rendimiento según sea necesario
