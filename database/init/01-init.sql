-- Script de inicialización para la base de datos del hotel
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar encoding
SET client_encoding = 'UTF8';

-- Crear índices adicionales si es necesario
-- (Django creará las tablas automáticamente)

-- Configurar timezone
SET timezone = 'UTC';

-- Log de inicialización
DO $$
BEGIN
    RAISE NOTICE 'Base de datos hotel_db inicializada correctamente';
END $$;
