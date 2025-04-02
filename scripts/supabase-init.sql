-- Este script inicializa la estructura necesaria para Supabase

-- Eliminación previa si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles;

-- Crear tabla de perfiles para usuarios
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(email),
  UNIQUE(username)
);

-- Configurar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso a perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Función que será llamada por el trigger para crear perfiles automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil cuando se crea un usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Tabla para archivos (con RLS)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  client_id INTEGER,
  company_id INTEGER,
  category TEXT NOT NULL DEFAULT 'other',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Configurar RLS para la tabla de archivos
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso a archivos
CREATE POLICY "Los usuarios pueden ver sus propios archivos"
  ON public.files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden subir archivos"
  ON public.files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden editar sus propios archivos"
  ON public.files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios archivos"
  ON public.files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Tabla para invitaciones de clientes
CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Configurar RLS para la tabla de invitaciones
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso a invitaciones
CREATE POLICY "Los usuarios pueden ver sus propias invitaciones"
  ON public.client_invitations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear invitaciones"
  ON public.client_invitations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los administradores pueden ver cualquier invitación"
  ON public.client_invitations
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));