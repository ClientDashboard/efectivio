-- Inicialización de esquema para Supabase
-- Este script crea todas las tablas necesarias para el sistema Efectivio

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuración de autenticación y tablas relacionadas
-- ====================================================

-- Tabla de perfiles de usuario (adicional a la tabla auth.users que maneja Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin', 'accountant')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Configurar política de seguridad a nivel de fila para perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger para crear un perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función cuando se crea un nuevo usuario
CREATE OR REPLACE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Tablas de contabilidad y gestión
-- ===============================

-- Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver clientes" 
  ON public.clients FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores pueden modificar clientes" 
  ON public.clients FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Enum para estados de facturas
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Facturas
CREATE TABLE IF NOT EXISTS public.invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status invoice_status DEFAULT 'draft' NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver facturas" 
  ON public.invoices FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y contadores pueden modificar facturas" 
  ON public.invoices FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Ítems de facturas
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  tax_rate NUMERIC(5, 2) DEFAULT 0
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver ítems de facturas" 
  ON public.invoice_items FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y contadores pueden modificar ítems de facturas" 
  ON public.invoice_items FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Enum para categorías de gastos
DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('office', 'travel', 'marketing', 'utilities', 'rent', 'salary', 'equipment', 'supplies', 'taxes', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Gastos
CREATE TABLE IF NOT EXISTS public.expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category expense_category DEFAULT 'other' NOT NULL,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver gastos" 
  ON public.expenses FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y contadores pueden modificar gastos" 
  ON public.expenses FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Enum para tipos de cuentas
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Plan de cuentas
CREATE TABLE IF NOT EXISTS public.accounts (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES public.accounts(id),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver cuentas" 
  ON public.accounts FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y contadores pueden modificar cuentas" 
  ON public.accounts FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Asientos contables
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  reference TEXT,
  description TEXT NOT NULL,
  source_type TEXT,
  source_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver asientos contables" 
  ON public.journal_entries FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y contadores pueden modificar asientos contables" 
  ON public.journal_entries FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Líneas de asientos contables
CREATE TABLE IF NOT EXISTS public.journal_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id),
  description TEXT,
  debit NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  credit NUMERIC(10, 2) DEFAULT 0 NOT NULL
);

ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver líneas de asientos contables" 
  ON public.journal_lines FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y contadores pueden modificar líneas de asientos contables" 
  ON public.journal_lines FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Portal de clientes y gestión de archivos
-- =======================================

-- Enum para categorías de archivos
DO $$ BEGIN
    CREATE TYPE file_category AS ENUM ('invoice', 'quote', 'receipt', 'contract', 'report', 'tax', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Archivos
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id INTEGER,
  company_id INTEGER,
  category file_category DEFAULT 'other' NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver sus archivos" 
  ON public.files FOR SELECT 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant')));

CREATE POLICY "Los usuarios pueden gestionar sus propios archivos" 
  ON public.files FOR ALL 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant')));

-- Invitaciones a clientes
CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los administradores y contadores pueden gestionar invitaciones" 
  ON public.client_invitations FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Usuario del portal de clientes
CREATE TABLE IF NOT EXISTS public.client_portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.client_portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los administradores y contadores pueden gestionar usuarios del portal" 
  ON public.client_portal_users FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Enum para estados de proyectos
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Proyectos
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status project_status DEFAULT 'pending' NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver proyectos" 
  ON public.projects FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores y propietarios pueden gestionar proyectos" 
  ON public.projects FOR ALL 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant')));

-- Enum para prioridades de tareas
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para estados de tareas
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tareas
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  priority task_priority DEFAULT 'medium' NOT NULL,
  status task_status DEFAULT 'pending' NOT NULL,
  estimated_hours NUMERIC(5, 2),
  actual_hours NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver tareas" 
  ON public.tasks FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios asignados y administradores pueden gestionar tareas" 
  ON public.tasks FOR ALL 
  USING (auth.role() = 'authenticated' AND (assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant')));

-- Registro de tiempo
CREATE TABLE IF NOT EXISTS public.time_entries (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  hours NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver entradas de tiempo" 
  ON public.time_entries FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios pueden gestionar sus propias entradas de tiempo" 
  ON public.time_entries FOR ALL 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant')));

-- Enum para tipos de citas
DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM ('meeting', 'call', 'video_call', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Citas
CREATE TABLE IF NOT EXISTS public.appointments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  type appointment_type DEFAULT 'meeting' NOT NULL,
  meeting_url TEXT,
  reminder_sent BOOLEAN DEFAULT false NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver citas" 
  ON public.appointments FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los propietarios y administradores pueden gestionar citas" 
  ON public.appointments FOR ALL 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant')));

-- Enum para proveedores de reuniones
DO $$ BEGIN
    CREATE TYPE meeting_provider AS ENUM ('google_meet', 'zoom', 'teams', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para estado de transcripción
DO $$ BEGIN
    CREATE TYPE transcription_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reuniones
CREATE TABLE IF NOT EXISTS public.meetings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  appointment_id INTEGER REFERENCES public.appointments(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  provider meeting_provider DEFAULT 'google_meet' NOT NULL,
  external_meeting_id TEXT,
  meeting_url TEXT,
  recording_url TEXT,
  recording_status TEXT DEFAULT 'not_started',
  transcription_status transcription_status DEFAULT 'pending',
  transcription TEXT,
  summary TEXT,
  duration INTEGER,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  participants TEXT[],
  key_points TEXT[],
  action_items TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver reuniones" 
  ON public.meetings FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores pueden gestionar reuniones" 
  ON public.meetings FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Segmentos de transcripción
CREATE TABLE IF NOT EXISTS public.transcription_segments (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  speaker_name TEXT,
  speaker_id TEXT,
  content TEXT NOT NULL,
  start_time NUMERIC(10, 3) NOT NULL,
  end_time NUMERIC(10, 3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.transcription_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver segmentos de transcripción" 
  ON public.transcription_segments FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores pueden gestionar segmentos de transcripción" 
  ON public.transcription_segments FOR ALL 
  USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'accountant'));

-- Integraciones de reuniones
CREATE TABLE IF NOT EXISTS public.meeting_integrations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider meeting_provider NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  settings TEXT[],
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.meeting_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias integraciones" 
  ON public.meeting_integrations FOR SELECT 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

CREATE POLICY "Los usuarios pueden gestionar sus propias integraciones" 
  ON public.meeting_integrations FOR ALL 
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Datos iniciales
-- ==============

-- Insertar cuentas contables básicas si no existen
INSERT INTO public.accounts (code, name, type, description, is_active)
SELECT '1000', 'Caja y Bancos', 'asset', 'Efectivo y equivalentes de efectivo', true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '1000');

INSERT INTO public.accounts (code, name, type, description, is_active)
SELECT '1200', 'Cuentas por Cobrar', 'asset', 'Derechos de cobro a clientes', true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '1200');

INSERT INTO public.accounts (code, name, type, description, is_active)
SELECT '2000', 'Cuentas por Pagar', 'liability', 'Obligaciones con proveedores', true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '2000');

INSERT INTO public.accounts (code, name, type, description, is_active)
SELECT '3000', 'Capital', 'equity', 'Capital social', true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '3000');

INSERT INTO public.accounts (code, name, type, description, is_active)
SELECT '4000', 'Ingresos', 'revenue', 'Ingresos por ventas', true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '4000');

INSERT INTO public.accounts (code, name, type, description, is_active)
SELECT '5000', 'Gastos', 'expense', 'Gastos generales', true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '5000');

-- Función para actualizar marcas de tiempo
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar las marcas de tiempo
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I;
            CREATE TRIGGER set_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Crear buckets de almacenamiento si no existen
SELECT storage.create_bucket('documents', 'Documentos generales') 
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'documents');

SELECT storage.create_bucket('invoices', 'Facturas') 
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'invoices');

SELECT storage.create_bucket('receipts', 'Recibos y comprobantes') 
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'receipts');

SELECT storage.create_bucket('contracts', 'Contratos') 
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'contracts');

SELECT storage.create_bucket('profiles', 'Imágenes de perfil') 
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profiles');

SELECT storage.create_bucket('meeting_recordings', 'Grabaciones de reuniones') 
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'meeting_recordings');

-- Permisos para buckets de almacenamiento
DO $$ 
DECLARE
    b text;
BEGIN
    FOR b IN 
        SELECT name FROM storage.buckets
    LOOP
        EXECUTE format('
            CREATE POLICY "Los usuarios autenticados pueden leer %1$I"
            ON storage.objects FOR SELECT
            TO authenticated
            USING (bucket_id = ''%1$I'' AND (storage.foldername(name))[1] = auth.uid()::text);
            
            CREATE POLICY "Los usuarios pueden insertar en %1$I"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = ''%1$I'' AND (storage.foldername(name))[1] = auth.uid()::text);
            
            CREATE POLICY "Los usuarios pueden actualizar en %1$I"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (bucket_id = ''%1$I'' AND (storage.foldername(name))[1] = auth.uid()::text);
            
            CREATE POLICY "Los usuarios pueden eliminar en %1$I"
            ON storage.objects FOR DELETE
            TO authenticated
            USING (bucket_id = ''%1$I'' AND (storage.foldername(name))[1] = auth.uid()::text);
        ', b);
    END LOOP;
END;
$$ LANGUAGE plpgsql;