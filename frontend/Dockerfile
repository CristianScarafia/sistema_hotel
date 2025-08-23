FROM node:20-alpine AS build

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar archivos construidos
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copiar script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Configurar puerto
ENV PORT=8080

# Script de inicio
CMD ["/start.sh"]
