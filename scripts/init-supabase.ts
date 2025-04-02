import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Obtener el directorio actual en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener credenciales de Supabase de las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en las variables de entorno');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de rol de servicio para tener privilegios de administrador
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Función para ejecutar consultas SQL individuales
async function executeSQL(query: string, description: string): Promise<boolean> {
  try {
    console.log(`Ejecutando: ${description}...`);
    const { data, error } = await supabase.rpc('execute_sql', { query });
    
    if (error) {
      console.error(`Error en ${description}:`, error);
      return false;
    }
    
    console.log(`${description} completado`);
    return true;
  } catch (error) {
    console.error(`Error en ${description}:`, error);
    return false;
  }
}

// Crear la función personalizada para ejecutar SQL
async function createExecuteSQLFunction() {
  console.log('Creando función execute_sql en Supabase...');
  
  try {
    // API REST de Supabase no permite la creación directa de funciones SQL
    // Debemos usar el dashboard de Supabase o SQL Editor para crear esta función
    
    console.log('NOTA: Para crear la función execute_sql, necesitas ejecutar el siguiente SQL en el SQL Editor de Supabase:');
    console.log(`
    CREATE OR REPLACE FUNCTION execute_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
    `);
    
    console.log('Una vez creada la función, vuelve a ejecutar este script.');
  } catch (error) {
    console.error('Error al intentar crear la función execute_sql:', error);
  }
}

async function createProfilesTables() {
  const createProfilesTable = `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE,
      username TEXT UNIQUE,
      full_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (id)
    );
  `;
  
  const enableRLS = `
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  `;
  
  const createPolicies = `
    CREATE POLICY IF NOT EXISTS "Los perfiles son visibles por usuarios autenticados"
      ON profiles FOR SELECT
      USING (auth.role() = 'authenticated');
      
    CREATE POLICY IF NOT EXISTS "Los usuarios pueden actualizar su propio perfil"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
  `;
  
  // Intentar crear las tablas y políticas a través de consultas directas
  const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
  
  if (profilesError && profilesError.code === 'PGRST301') {
    // La tabla no existe
    try {
      console.log('Intentando crear tabla de perfiles y políticas directamente...');
      console.log('NOTA: Esto puede no funcionar debido a las limitaciones de la API de Supabase.');
      console.log('Es posible que necesites crear estas tablas manualmente desde el SQL Editor de Supabase');
      
      console.log('Script SQL que debe ejecutarse:');
      console.log(createProfilesTable);
      console.log(enableRLS);
      console.log(createPolicies);
      
      // Solicitar al usuario que lo haga manualmente
      console.log('\nPor favor, ejecuta el script SQL anterior en el SQL Editor de Supabase.');
    } catch (error) {
      console.error('Error al intentar crear tablas:', error);
    }
  } else {
    console.log('La tabla de perfiles ya existe o no se pudo verificar su existencia.');
  }
}

async function createTrigger() {
  console.log('Intentando crear el trigger para nuevos usuarios...');
  console.log('NOTA: Esto debe hacerse desde el SQL Editor de Supabase.');
  
  const triggerSQL = `
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, username, full_name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `;
  
  console.log('Script SQL para el trigger:');
  console.log(triggerSQL);
  console.log('\nPor favor, ejecuta este script en el SQL Editor de Supabase.');
}

async function initializeSupabase() {
  try {
    console.log('Iniciando la configuración de Supabase...');
    
    // Intentar crear la función SQL (esto probablemente fallará)
    await createExecuteSQLFunction();
    
    // Intentar crear las tablas y políticas
    await createProfilesTables();
    
    // Intentar crear el trigger
    await createTrigger();
    
    console.log('\nInstrucciones para configuración manual de Supabase:');
    console.log('1. Inicia sesión en tu dashboard de Supabase');
    console.log('2. Ve a SQL Editor');
    console.log('3. Copia y pega los scripts SQL mostrados arriba');
    console.log('4. Ejecuta los scripts');
    
    console.log('\nUna vez completados estos pasos, tu Supabase estará configurado correctamente para la aplicación Efectivio.');
    
  } catch (error) {
    console.error('Error durante la inicialización de Supabase:', error);
  }
}

// Ejecutar la función principal
initializeSupabase();