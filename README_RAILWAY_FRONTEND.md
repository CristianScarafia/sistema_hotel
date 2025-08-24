# Deploy del Frontend en Railway

## Configuración Actual

El proyecto está configurado para hacer deploy del frontend en Railway usando Docker. Railway está configurado para usar el directorio `frontend/` como directorio raíz del build.

Los archivos principales son:

- `frontend/Dockerfile` - Dockerfile para el frontend
- `Dockerfile.backend` - Dockerfile del backend (en la raíz)
- `railway-frontend.json` - Configuración específica para Railway
- `frontend/.dockerignore` - Archivos excluidos del build del frontend

## Configuración de Railway

Railway está configurado para:
- **Source Directory**: `frontend/` (directorio raíz del build)
- **Dockerfile Path**: `Dockerfile` (dentro del directorio frontend)
- **Builder**: `DOCKERFILE`

## Pasos para el Deploy

### 1. Verificar la configuración

Asegúrate de que los siguientes archivos estén presentes y correctos:

- ✅ `frontend/Dockerfile`
- ✅ `railway-frontend.json`
- ✅ `frontend/.dockerignore`
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
   - **Source Directory**: `frontend/`
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

El Dockerfile en `frontend/Dockerfile`:

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
- **Solución**: Asegúrate de que Railway esté configurado para usar el directorio `frontend/`

### Error: "npm not found"
- **Causa**: Problema con la instalación de Node.js
- **Solución**: Verifica que el Dockerfile use la imagen correcta de Node.js

### Error: "Build failed"
- **Causa**: Problemas con las dependencias o el código
- **Solución**: 
  1. Ejecuta `npm ci` localmente en el directorio `frontend/`
  2. Ejecuta `npm run build` localmente en el directorio `frontend/`
  3. Revisa los logs de Railway para más detalles

### Error: "frontend directory not found"
- **Causa**: Railway no está configurado para usar el directorio `frontend/`
- **Solución**: Verifica la configuración de Railway para usar `frontend/` como Source Directory

## Variables de Entorno

El frontend puede necesitar las siguientes variables de entorno en Railway:

- `PORT` - Puerto donde se ejecutará la aplicación (Railway lo establece automáticamente)
- `REACT_APP_API_URL` - URL del backend (si es necesario)

## Comandos Útiles

### Build local para pruebas
```bash
cd frontend
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

1. **Railway usa el directorio `frontend/` como directorio raíz del build**
2. **El Dockerfile está en `frontend/Dockerfile`**
3. **El contexto de build es el directorio `frontend/`**
4. **Railway debe estar configurado para usar `frontend/` como Source Directory**

## Configuración de Railway

En Railway Dashboard, asegúrate de que el servicio del frontend tenga:

- **Source Directory**: `frontend/`
- **Dockerfile Path**: `Dockerfile`
- **Builder**: `DOCKERFILE`

## Rollback

Si necesitas volver a una configuración anterior:

1. Revisa el historial de commits
2. Haz rollback del commit específico
3. Vuelve a hacer deploy

## Verificación del Deploy

Para verificar que el deploy funcionó correctamente:

1. **Build exitoso**: Sin errores en los logs de Railway
2. **Servicio funcionando**: El contenedor está ejecutándose
3. **Aplicación accesible**: La URL de Railway muestra la aplicación React
4. **Sin errores de ESLint**: El build se completó sin advertencias
