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

## Notas Importantes

⚠️ **Backend separado:** Esta configuración solo despliega el frontend. Para el backend necesitarás:
- Un servicio separado en Railway, o
- Usar otro proveedor (Heroku, DigitalOcean, etc.)

🔧 **API URL:** Asegúrate de configurar `REACT_APP_API_URL` apuntando a tu backend desplegado.

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
