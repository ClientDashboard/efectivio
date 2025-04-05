-- Script para actualizar la tabla de usuarios
-- Este script actualiza la estructura de la tabla de usuarios para que coincida con el schema.ts

-- Primero, crear el tipo enum para roles de usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'gerente_general',
            'contabilidad',
            'director_ventas',
            'director_recursos_humanos',
            'director_produccion',
            'director_logistica',
            'operario',
            'vendedor',
            'administrador_sistema'
        );
    END IF;
END$$;

-- Añadir las columnas faltantes a la tabla 'users' si no existen
DO $$
BEGIN
    -- Validar si falta la columna 'is_active'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;

    -- Validar si falta la columna 'profile_image_url'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
        ALTER TABLE users ADD COLUMN profile_image_url TEXT;
    END IF;

    -- Validar si falta la columna 'last_login'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;

    -- Actualizar tipo de columna role si es necesario (convertirla a enum)
    -- Esta parte es más compleja y podría requerir migración de datos
    -- Por ahora la dejamos como está, pero idealmente se debería cambiar 
    -- a usar el tipo enum 'user_role'
    
    -- Verificar si existe la columna 'role' y es tipo text
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- Podríamos convertir la columna a tipo enum, pero primero asegurémonos
        -- de que los datos sean compatibles
        -- Por ahora, mantenemos el tipo text
        -- En una futura migración se podría hacer la conversión completa
    END IF;
END$$;

-- Actualizar o crear la columna 'fullName'
DO $$
BEGIN
    -- Verificar si la columna 'fullname' no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'fullname'
    ) THEN
        -- Si existe 'full_name', renombrarla a 'fullname'
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'full_name'
        ) THEN
            ALTER TABLE users RENAME COLUMN full_name TO fullname;
        -- Si no existe ni 'full_name' ni 'fullname', crearla
        ELSIF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND (column_name = 'full_name' OR column_name = 'fullname')
        ) THEN
            ALTER TABLE users ADD COLUMN fullname TEXT;
            
            -- Si existe la columna 'name', copiar sus datos a 'fullname'
            IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'name'
            ) THEN
                UPDATE users SET fullname = name WHERE fullname IS NULL;
            END IF;
        END IF;
    END IF;
END$$;

-- Crear tabla de registros de auditoría si no existe
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_name TEXT,
    details TEXT,
    changes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- COMMIT al final para asegurar que todos los cambios se apliquen
COMMIT;
