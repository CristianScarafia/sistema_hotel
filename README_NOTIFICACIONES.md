# Sistema de Notificaciones Toastr

## Descripción
Sistema de notificaciones implementado con la librería Toastr para mostrar mensajes de éxito, error, advertencia e información de manera sutil y no invasiva.

## Características
1. **Notificaciones sutiles**: Aparecen en la esquina superior derecha sin desplazar elementos
2. **Auto-cierre**: Se cierran automáticamente después de 5 segundos
3. **Tipos de mensajes**: Success, Error, Warning, Info
4. **Responsive**: Se adaptan a diferentes tamaños de pantalla
5. **Personalización**: Estilos consistentes con el tema del proyecto
6. **Integración con Django**: Compatible con el framework de mensajes de Django
7. **Sin bloques fijos**: Eliminados todos los bloques de mensajes que desplazaban elementos

## Tipos de Notificaciones
- **Success (Verde)**: Operaciones exitosas
- **Error (Rojo)**: Errores y validaciones fallidas
- **Warning (Amarillo)**: Advertencias
- **Info (Azul)**: Información general

## Operaciones Cubiertas
- ✅ **Crear habitación**: Notificación de éxito/error
- ✅ **Editar habitación**: Notificación de éxito/error
- ✅ **Eliminar habitación**: Confirmación + notificación de éxito/error
- ✅ **Crear reserva**: Notificación de éxito/error
- ✅ **Editar reserva**: Notificación de éxito/error
- ✅ **Eliminar reserva**: Confirmación + notificación de éxito/error
- ✅ **Crear usuario**: Notificación de éxito/error
- ✅ **Login/Logout**: Notificación de éxito/error

## Dependencias
- **Toastr**: `^2.1.4` - Librería de notificaciones JavaScript
- **Django Messages Framework**: Sistema nativo de Django para mensajes

## Archivos Modificados/Creados

### Archivos de Configuración
- `package.json` - Agregada dependencia Toastr
- `reservas/templates/base.html` - Integración de Toastr y eliminación del sistema personalizado
- `reservas/static/css/custom.css` - Estilos personalizados para Toastr

### Archivos de Librería
- `reservas/static/js/vendor/toastr/toastr.min.js` - Archivo JavaScript de Toastr
- `reservas/static/css/vendor/toastr/toastr.min.css` - Archivo CSS de Toastr

### Templates Limpiados
- `reservas/templates/reservas/cargar_habitacion.html` - Eliminado bloque de mensajes personalizado
- `reservas/templates/reservas/cargar_reserva.html` - Eliminado bloque de mensajes personalizado
- `reservas/templates/reservas/editar_habitacion.html` - Eliminado bloque de mensajes personalizado
- `reservas/templates/reservas/editar_reserva.html` - Eliminado bloque de mensajes personalizado
- `reservas/templates/reservas/crear_usuario.html` - Eliminado bloque de mensajes personalizado
- `reservas/templates/registration/login.html` - Eliminado bloque de errores fijos

## Estilos (CSS)
Los estilos personalizados para Toastr incluyen:
- Colores consistentes con el tema del proyecto
- Bordes redondeados y sombras sutiles
- Responsive design para móviles y tablets
- Animaciones suaves de entrada y salida

## JavaScript
- Configuración de Toastr en `base.html`
- Integración automática con mensajes de Django
- Función global `showToast()` para notificaciones dinámicas

## Configuración de Toastr
```javascript
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
```

## Responsive Design
- **Desktop**: Notificaciones de 300-400px de ancho
- **Tablet**: Notificaciones de 280-320px de ancho
- **Móvil**: Notificaciones de 260-300px de ancho

## Personalización
Los estilos se pueden personalizar modificando las reglas CSS en `custom.css`:
- Colores de fondo y texto
- Tamaños y espaciados
- Animaciones y transiciones
- Posición y z-index

## Ventajas de la Nueva Implementación

### Antes (Sistema Personalizado)
- ❌ Mensajes desplazaban elementos de la pantalla
- ❌ Bloques fijos de errores entre elementos
- ❌ Sistema complejo de mantener
- ❌ Estilos inconsistentes
- ❌ No responsive

### Ahora (Toastr)
- ✅ Notificaciones sutiles que no desplazan elementos
- ✅ Sin bloques fijos de errores
- ✅ Librería profesional y mantenida
- ✅ Estilos consistentes y personalizables
- ✅ Totalmente responsive
- ✅ Auto-cierre y animaciones suaves
- ✅ Integración perfecta con Django

## Uso

### En Django (Backend)
```python
from django.contrib import messages

# Mensaje de éxito
messages.success(request, "Habitación creada exitosamente")

# Mensaje de error
messages.error(request, "Error al crear la habitación")

# Mensaje de advertencia
messages.warning(request, "Advertencia importante")

# Mensaje informativo
messages.info(request, "Información del sistema")
```

### En JavaScript (Frontend)
```javascript
// Función global disponible
showToast("Mensaje personalizado", "success");
showToast("Error personalizado", "error");
showToast("Advertencia", "warning");
showToast("Información", "info");
```

## Instalación
1. Instalar dependencias: `npm install`
2. Copiar archivos de Toastr a las carpetas vendor
3. Los templates ya están configurados automáticamente
4. El sistema está listo para usar

## Notas Técnicas
- Las notificaciones aparecen en la esquina superior derecha
- Se auto-cierran después de 5 segundos
- Incluyen barra de progreso
- Botón de cierre manual disponible
- Compatible con todos los navegadores modernos

## Troubleshooting

### Problema: Notificaciones no aparecen
**Síntomas**: 
- Las notificaciones Toastr no se muestran al realizar operaciones CRUD
- No hay errores visibles en la consola del navegador

**Causa común**: Archivos estáticos no recolectados
**Solución**: Recolectar archivos estáticos
```bash
# Recolectar archivos estáticos
make dev-collectstatic

# Verificar que los archivos de Toastr estén en STATIC_ROOT
docker-compose -f docker-compose.dev.yml exec web ls -la /app/staticfiles/js/vendor/toastr/
docker-compose -f docker-compose.dev.yml exec web ls -la /app/staticfiles/css/vendor/toastr/
```

### Problema: Archivos de Toastr no encontrados
**Síntomas**: 
- Error 404 al cargar archivos de Toastr
- Mensaje "toastr is not defined" en consola

**Solución**: Verificar instalación de Toastr
```bash
# Verificar que los archivos estén en las carpetas correctas
docker-compose -f docker-compose.dev.yml exec web ls -la /app/reservas/static/js/vendor/toastr/
docker-compose -f docker-compose.dev.yml exec web ls -la /app/reservas/static/css/vendor/toastr/

# Si no están, reinstalar Toastr
docker-compose -f docker-compose.dev.yml exec web npm install
```

### Problema: Mensajes de Django no se muestran
**Síntomas**: 
- Los mensajes de Django no aparecen como notificaciones Toastr
- Los mensajes aparecen como bloques fijos en la página

**Solución**: Verificar configuración de mensajes
```bash
# Verificar que el middleware de mensajes esté configurado
# Verificar que el context processor de mensajes esté configurado
# Verificar que los templates no tengan bloques de mensajes personalizados
```
