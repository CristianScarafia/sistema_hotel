#!/bin/sh

# Script de inicio para Railway
echo "Starting nginx server..."

# Obtener el puerto desde la variable de entorno
PORT=${PORT:-8080}
# Normalizar REACT_APP_API_URL sin barra final para luego agregarla en nginx
REACT_APP_API_URL=${REACT_APP_API_URL:-https://sistemahotel-production-5a7f.up.railway.app/api}
REACT_APP_API_URL=${REACT_APP_API_URL%/}

echo "Configurando nginx con:"
echo "PORT: $PORT"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"

# Usar envsubst para procesar la plantilla con variables de entorno
envsubst '${PORT} ${REACT_APP_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Mostrar la configuración generada (solo en desarrollo)
if [ "$NODE_ENV" = "development" ]; then
    echo "Configuración de nginx generada:"
    cat /etc/nginx/conf.d/default.conf
fi

# Iniciar nginx en primer plano
nginx -g 'daemon off;'
