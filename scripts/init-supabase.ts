import { createClient } from '@supabase/supabase-js';
import { Client } from '@neondatabase/serverless';
import { getClient, closeClient } from '../server/db';

// Verificar que tenemos las variables de entorno necesarias
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Se requieren las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente de Supabase con clave de administrador
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para ejecutar consultas SQL
async function executeSQL(query: string, description: string): Promise<boolean> {
  let client: Client | null = null;
  try {
    client = await getClient();
    await client.query(query);
    console.log(`✓ ${description}`);
    return true;
  } catch (error) {
    console.error(`✗ Error en ${description}:`, error);
    return false;
  } finally {
    if (client) {
      await closeClient(client);
    }
  }
}

// Crear función que será utilizada por el trigger
async function createExecuteSQLFunction() {
  const functionSQL = `
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
  `;

  return executeSQL(functionSQL, 'Crear función handle_new_user');
}

// Crear tabla de perfiles para usuarios
async function createProfilesTables() {
  const profilesTableSQL = `
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
    
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Usuarios pueden ver su propio perfil" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);

    CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  `;

  return executeSQL(profilesTableSQL, 'Crear tabla de perfiles');
}

// Crear trigger para nuevos usuarios
async function createTrigger() {
  const triggerSQL = `
    CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  `;

  return executeSQL(triggerSQL, 'Crear trigger para nuevos usuarios');
}

// Función principal para inicializar Supabase
async function initializeSupabase() {
  console.log('Inicializando configuración de Supabase...');

  // Crear tablas y funciones en orden
  const functionCreated = await createExecuteSQLFunction();
  const profilesCreated = await createProfilesTables();
  const triggerCreated = await createTrigger();

  if (functionCreated && profilesCreated && triggerCreated) {
    console.log('✅ Inicialización de Supabase completada con éxito');
  } else {
    console.error('❌ Hubo errores durante la inicialización de Supabase');
    process.exit(1);
  }
}

// Ejecutar la inicialización
initializeSupabase()
  .catch(error => {
    console.error('Error fatal durante la inicialización:', error);
    process.exit(1);
  });