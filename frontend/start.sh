#!/bin/sh

# Script de inicio para Railway
echo "Starting nginx server..."

# Obtener el puerto desde la variable de entorno
PORT=${PORT:-8080}

# Crear configuración de nginx dinámicamente
cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location = /index.html { 
        add_header Cache-Control "no-store"; 
        try_files \$uri =404; 
    }
    
    location / { 
        try_files \$uri \$uri/ /index.html; 
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on; 
    gzip_vary on; 
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json application/xml text/xml image/svg+xml;
}
EOF

# Iniciar nginx en primer plano
nginx -g 'daemon off;'
