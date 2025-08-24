# Multi-stage build para optimizar el tamaño final
FROM node:20-alpine AS build

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar archivos de dependencias del frontend
COPY package*.json ./

# Instalar dependencias con optimizaciones
RUN npm ci --only=production --silent \
    && npm cache clean --force

# Copiar código fuente del frontend
COPY . .

# Construir la aplicación con optimizaciones
RUN npm run build \
    && rm -rf node_modules \
    && apk del .build-deps

# Etapa de producción con nginx
FROM nginx:alpine

# Instalar gettext de forma más eficiente
RUN apk add --no-cache --virtual .gettext-deps gettext \
    && rm -rf /var/cache/apk/*

# Copiar archivos construidos
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copiar script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Configurar puerto
ENV PORT=8080

# Limpiar dependencias temporales
RUN apk del .gettext-deps

# Script de inicio
CMD ["/start.sh"]
