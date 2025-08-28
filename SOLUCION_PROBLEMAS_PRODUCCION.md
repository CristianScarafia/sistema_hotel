# Solución de Problemas de Producción

## Problemas Identificados y Soluciones

### 1. Error 404 en `/api/perfiles/mi-perfil/`

**Problema**: El endpoint no encuentra el perfil del usuario.

**Solución**: 
- Se modificó el endpoint para crear automáticamente un perfil si no existe
- Se creó un comando de gestión `create_default_profiles` para crear perfiles por defecto
- Se mejoró la función `is_supervisor` para manejar casos donde no hay perfil

### 2. Error 403 en creación de habitaciones

**Problema**: Los usuarios no tienen permisos de supervisor.

**Solución**:
- Se mejoró la función `is_supervisor` para crear perfiles automáticamente
- Los superusuarios (admin) ahora tienen automáticamente rol de supervisor
- Se crean perfiles por defecto con rol apropiado

### 3. Error de WebSocket

**Problema**: Conexión fallida a `wss://hotelbermudas.up.railway.app:8080/ws`

**Solución**:
- Se eliminaron las referencias a WebSocket que no están en uso
- Se mejoró la configuración de nginx para no intentar conexiones WebSocket

### 4. Configuración de entorno en producción

**Problema**: El frontend está en modo development en producción.

**Solución**:
- Se configuró `NODE_ENV=production` en el docker-compose
- Se mejoró el debug para que solo se ejecute en desarrollo
- Se configuró nginx para manejar variables de entorno correctamente

## Pasos para Aplicar las Soluciones

### 1. Ejecutar migraciones y crear perfiles

```bash
# En el contenedor del backend
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py create_default_profiles
```

### 2. Reconstruir y desplegar

```bash
# Reconstruir las imágenes
docker-compose -f docker-compose.prod.yml build

# Desplegar en Railway
./scripts/deploy-railway.ps1
```

### 3. Verificar la configuración

```bash
# Verificar que las variables de entorno estén configuradas
railway variables list

# Verificar los logs
railway logs
```

## Variables de Entorno Requeridas

### Backend
- `DATABASE_URL`: URL de la base de datos PostgreSQL
- `SECRET_KEY`: Clave secreta de Django
- `DEBUG`: False para producción
- `ALLOWED_HOSTS`: Dominios permitidos
- `CORS_ALLOWED_ORIGINS`: Orígenes permitidos para CORS

### Frontend
- `REACT_APP_API_URL`: URL del backend API
- `PORT`: Puerto del frontend (configurado por Railway)
- `NODE_ENV`: production

## Verificación de la Solución

1. **Login**: Debería funcionar sin errores 404
2. **Creación de habitaciones**: Los superusuarios deberían poder crear habitaciones
3. **Perfiles**: Se deberían crear automáticamente
4. **WebSocket**: No deberían aparecer errores de conexión WebSocket
5. **Debug**: No deberían aparecer logs de debug en producción

## Comandos Útiles

```bash
# Ver logs del backend
railway logs --service backend

# Ver logs del frontend
railway logs --service frontend

# Ejecutar comando en el backend
railway run --service backend python manage.py shell

# Verificar estado de los servicios
railway status
```

## Notas Importantes

- Los perfiles se crean automáticamente al hacer login
- Los superusuarios tienen automáticamente rol de supervisor
- El frontend está configurado para producción con nginx
- Las variables de entorno se configuran automáticamente en Railway
