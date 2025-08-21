# Gestión de Base de Datos - Desarrollo

## Problema Común: Pérdida de Usuarios en Builds

Cuando haces un `docker-compose build` o `docker-compose up --build`, los contenedores se recrean desde cero, pero los datos de la base de datos se mantienen en el volumen `db_data`. Sin embargo, si el volumen se elimina o hay problemas de configuración, puedes perder los usuarios.

## Soluciones Implementadas

### 1. Creación Automática de Superusuario

El `entrypoint.sh` ahora crea automáticamente un superusuario por defecto si no existe:

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Email**: `admin@hotel.com`
- **Rol**: Supervisor (con permisos para crear usuarios)

**Nota**: El comando `crear_supervisor` verifica y corrige automáticamente el rol del usuario si ya existe pero no tiene permisos de supervisor.

### 2. Comandos de Gestión

#### Comandos Básicos
```bash
# Inicializar proyecto completo
make init-dev

# Construir y levantar servicios
make dev-build
make dev-up

# Ver logs
make dev-logs

# Acceder al shell de Django
make dev-shell
```

#### Comandos de Base de Datos
```bash
# Crear superusuario manualmente
make dev-createsuperuser

# Ejecutar migraciones
make dev-migrate

# Crear migraciones
make dev-makemigrations

# Acceder al shell de PostgreSQL
make dev-db-shell

# Crear backup de la base de datos
make dev-db-backup

# Restaurar backup (especificar archivo)
make dev-db-restore BACKUP_FILE=backup_dev_20240820_120000.sql

# Resetear base de datos (¡CUIDADO! Elimina todos los datos)
make dev-db-reset
```

## Flujo de Trabajo Recomendado

### Primera Vez
```bash
# 1. Inicializar proyecto completo
make init-dev

# 2. Verificar que todo funciona
make dev-logs
```

### Desarrollo Diario
```bash
# 1. Levantar servicios
make dev-up

# 2. Si necesitas crear un superusuario
make dev-createsuperuser

# 3. Si hay cambios en modelos
make dev-makemigrations
make dev-migrate
```

### Cuando Haces Build
```bash
# 1. Hacer build (los datos se mantienen)
make dev-build

# 2. Si necesitas resetear completamente
make dev-db-reset
```

## Estructura de Volúmenes

```
docker-compose.dev.yml
├── db_data (volumen persistente)
│   └── /var/lib/postgresql/data
└── ./database/init (scripts de inicialización)
```

## Backup y Restauración

### Crear Backup
```bash
make dev-db-backup
# Crea: backup_dev_20240820_120000.sql
```

### Restaurar Backup
```bash
make dev-db-restore BACKUP_FILE=backup_dev_20240820_120000.sql
```

### Backup Manual
```bash
# Acceder al shell de PostgreSQL
make dev-db-shell

# Dentro del shell de PostgreSQL
pg_dump -U postgres hotel_db > /tmp/backup.sql
\q

# Copiar desde el contenedor
docker cp hotel_web_dev:/tmp/backup.sql ./backup_manual.sql
```

## Troubleshooting

### Problema: "No such table: auth_user"
**Solución**: Ejecutar migraciones
```bash
make dev-migrate
```

### Problema: "Connection refused"
**Solución**: Verificar que los servicios estén levantados
```bash
make dev-up
make dev-logs
```

### Problema: "Permission denied"
**Solución**: Verificar permisos de archivos
```bash
# En Windows, ejecutar PowerShell como administrador
# En Linux/Mac
chmod -R 755 ./reservas/static
```

### Problema: Volumen corrupto
**Solución**: Resetear base de datos
```bash
make dev-db-reset
```

### Problema: Usuario admin no puede crear usuarios
**Síntomas**: 
- El usuario admin existe pero no puede acceder a la función de crear usuarios
- Aparece mensaje "Acceso denegado. Solo los supervisores pueden acceder a esta función."

**Solución**: Verificar y corregir permisos
```bash
# Verificar estado del usuario
docker-compose -f docker-compose.dev.yml exec web python manage.py crear_supervisor

# Si el problema persiste, ejecutar manualmente
docker-compose -f docker-compose.dev.yml exec web python manage.py shell
```

En el shell de Django:
```python
from django.contrib.auth.models import User
from reservas.models import PerfilUsuario

user = User.objects.get(username='admin')
perfil = user.perfil
perfil.rol = 'supervisor'
perfil.save()
print(f"Rol actualizado: {perfil.get_rol_display()}")
```

## Variables de Entorno

Archivo `.env`:
```env
# Base de datos
POSTGRES_DB=hotel_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234
DB_PORT=5432

# Django
DJANGO_SETTINGS_MODULE=myproject.settings.development
SECRET_KEY=dev-unsafe-secret

# Servidor web
WEB_PORT=8000
```

## Comandos Útiles Adicionales

### Ver Estado de Contenedores
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Ver Uso de Recursos
```bash
docker stats
```

### Limpiar Docker
```bash
make clean
```

### Limpiar Todo (¡CUIDADO!)
```bash
make clean-all
```

## Notas Importantes

1. **Los datos se mantienen** entre builds gracias al volumen `db_data`
2. **El superusuario se crea automáticamente** si no existe
3. **Las migraciones se ejecutan automáticamente** al levantar los servicios
4. **Los archivos estáticos se recolectan automáticamente**
5. **El volumen se puede resetear** con `make dev-db-reset` si es necesario

## Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Supervisor
- **Email**: `admin@hotel.com`

## URLs de Acceso

- **Aplicación**: http://localhost:8000
- **Base de datos**: localhost:5432
- **Usuario DB**: postgres
- **Contraseña DB**: 1234
