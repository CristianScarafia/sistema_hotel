# Deploy del Frontend en Railway

## Configuración Actual

El proyecto está configurado para hacer deploy del frontend en Railway usando Docker. Los archivos principales son:

- `Dockerfile` - Dockerfile principal para el frontend (renombrado desde Dockerfile.frontend)
- `Dockerfile.backend` - Dockerfile del backend (renombrado desde Dockerfile original)
- `railway-frontend.json` - Configuración específica para Railway
- `.dockerignore` - Archivos excluidos del build

## Pasos para el Deploy

### 1. Verificar la configuración

Asegúrate de que los siguientes archivos estén presentes y correctos:

- ✅ `Dockerfile` (para frontend)
- ✅ `railway-frontend.json`
- ✅ `.dockerignore`
- ✅ `frontend/package.json`
- ✅ `frontend/nginx.conf.template`
- ✅ `frontend/start.sh`

### 2. Hacer Commit de los cambios

```bash
git add .
git commit -m "Configuración para deploy del frontend en Railway"
git push origin main
```

### 3. Deploy en Railway

#### Opción A: Desde Railway Dashboard
1. Ve a tu proyecto en Railway
2. Selecciona el servicio del frontend
3. En la configuración de build:
   - **Source Directory**: `/` (raíz del proyecto)
   - **Dockerfile Path**: `Dockerfile`
4. Haz click en "Deploy"

#### Opción B: Desde CLI
```bash
railway up --service frontend
```

### 4. Verificar el Deploy

Una vez completado el deploy:
1. Verifica que el servicio esté funcionando
2. Accede a la URL proporcionada por Railway
3. Verifica que la aplicación React se cargue correctamente

## Estructura del Dockerfile

El Dockerfile actual:

1. **Etapa de Build**:
   - Usa Node.js 20 Alpine
   - Instala dependencias del sistema
   - Copia `package.json` y `package-lock.json`
   - Instala dependencias con `npm ci`
   - Copia el código fuente
   - Construye la aplicación con `npm run build`

2. **Etapa de Producción**:
   - Usa Nginx Alpine
   - Instala gettext para envsubst
   - Copia los archivos construidos
   - Copia la configuración de Nginx
   - Copia el script de inicio
   - Configura el puerto 8080

## Solución de Problemas

### Error: "requirements.txt not found"
- **Causa**: Railway está usando el Dockerfile del backend
- **Solución**: Asegúrate de que el Dockerfile principal sea el del frontend

### Error: "npm not found"
- **Causa**: Problema con la instalación de Node.js
- **Solución**: Verifica que el Dockerfile use la imagen correcta de Node.js

### Error: "Build failed"
- **Causa**: Problemas con las dependencias o el código
- **Solución**: 
  1. Ejecuta `npm ci` localmente para verificar dependencias
  2. Ejecuta `npm run build` localmente para verificar el build
  3. Revisa los logs de Railway para más detalles

## Variables de Entorno

El frontend puede necesitar las siguientes variables de entorno en Railway:

- `PORT` - Puerto donde se ejecutará la aplicación (Railway lo establece automáticamente)
- `REACT_APP_API_URL` - URL del backend (si es necesario)

## Comandos Útiles

### Build local para pruebas
```bash
docker build -t hotel-frontend-test .
```

### Ejecutar localmente
```bash
docker run -p 8080:8080 hotel-frontend-test
```

### Ver logs del contenedor
```bash
docker logs <container_id>
```

## Notas Importantes

1. **El Dockerfile principal ahora es para el frontend**
2. **El Dockerfile del backend está renombrado como `Dockerfile.backend`**
3. **Railway debe usar el `Dockerfile` principal**
4. **El `.dockerignore` excluye archivos del backend para optimizar el build**

## Rollback

Si necesitas volver al Dockerfile del backend:

```bash
mv Dockerfile Dockerfile.frontend
mv Dockerfile.backend Dockerfile
```

Y actualiza la configuración de Railway para usar el Dockerfile correcto.
