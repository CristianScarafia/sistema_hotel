# Multi-stage build para optimizar el tamaño final
FROM python:3.13-alpine AS builder

# Instalar dependencias del sistema necesarias para compilar
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    python3-dev \
    libffi-dev \
    linux-headers

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements primero para aprovechar la caché de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage final - imagen de producción
FROM python:3.13-alpine AS production

# Instalar solo las dependencias de runtime necesarias
RUN apk add --no-cache \
    postgresql-client \
    libpq \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1000 django && \
    adduser -D -s /bin/sh -u 1000 -G django django

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias instaladas desde el builder
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copiar código de la aplicación
COPY . .

# Cambiar permisos al usuario django
RUN chown -R django:django /app

# Cambiar al usuario no-root
USER django

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=myproject.settings.production

# Exponer puerto
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python manage.py check || exit 1

# Comando por defecto
CMD ["sh", "entrypoint-railway-final.sh"]


 