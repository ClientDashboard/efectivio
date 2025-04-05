-- Crear el enum para tipos de acciones de auditoría si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
        CREATE TYPE audit_action AS ENUM (
            'create', 'update', 'delete', 'view', 'export', 'import', 'restore', 'login', 'logout', 'other'
        );
    END IF;
END $$;

-- Crear el enum para tipos de entidades en auditoría si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_entity') THEN
        CREATE TYPE audit_entity AS ENUM (
            'client', 'invoice', 'quote', 'expense', 'account', 'journal', 'file', 'project', 'task', 'appointment', 'user', 'setting', 'other'
        );
    END IF;
END $$;

-- Crear la tabla audit_logs si no existe
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    action audit_action NOT NULL,
    entity_type audit_entity NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);