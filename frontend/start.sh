#!/bin/sh

# Script de inicio para Railway
echo "Starting nginx server..."

# Generar configuración de nginx con el puerto correcto
envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Iniciar nginx en primer plano
nginx -g 'daemon off;'
