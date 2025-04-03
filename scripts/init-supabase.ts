import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env.local');
  process.exit(1);
}

// Crear cliente de Supabase con permisos de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Ejecuta una consulta SQL en Supabase
 * @param query Consulta SQL a ejecutar
 * @param description Descripción de la operación
 * @returns Promise<boolean> true si la operación fue exitosa
 */
async function executeSQL(query: string, description: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('pgexec', { sql: query });
    
    if (error) {
      console.error(`Error al ${description}:`, error);
      return false;
    }
    
    console.log(`✅ ${description} exitoso`);
    return true;
  } catch (error) {
    console.error(`Error al ${description}:`, error);
    return false;
  }
}

/**
 * Crea una función pgexec personalizada en Supabase si no existe
 * Esta función permite ejecutar SQL desde JavaScript
 */
async function createExecuteSQLFunction() {
  console.log('Creando función pgexec...');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION pgexec (sql text) RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  let pgexecError;
  try {
    const { error } = await supabase.rpc('pgexec', { sql: createFunctionSQL });
    pgexecError = error;
  } catch (error) {
    pgexecError = { message: 'La función pgexec no existe todavía' };
  }

  if (pgexecError) {
    console.log('La función pgexec no existe. Creándola con un SQL inicial...');
    
    // Como no existe la función, debemos crearla con una SQL directa
    const { error } = await supabase.from('_postgrest_rpc').select('').limit(0);
    
    if (error) {
      console.error('Error accediendo a Supabase:', error);
      return false;
    }
    
    // Usar Postgres REST para ejecutar SQL directamente
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Accept': 'application/json',
        'Prefer': 'params=single-object',
        'X-Client-Info': '@supabase/js',
      },
      body: JSON.stringify({
        'query': createFunctionSQL
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creando función pgexec:', errorData);
      return false;
    }
    
    console.log('✅ Función pgexec creada correctamente');
    return true;
  }
  
  console.log('✅ Función pgexec ya existe');
  return true;
}

/**
 * Inicializa la base de datos de Supabase con el esquema requerido
 */
async function initializeSupabase() {
  console.log('🚀 Iniciando configuración de Supabase...');
  
  // Crear función pgexec si no existe
  const functionCreated = await createExecuteSQLFunction();
  if (!functionCreated) {
    console.error('❌ No se pudo crear la función pgexec');
    return;
  }
  
  // Leer el archivo SQL
  const sqlPath = path.join(__dirname, 'init-supabase.sql');
  let sqlScript: string;
  
  try {
    sqlScript = fs.readFileSync(sqlPath, 'utf8');
  } catch (error) {
    console.error(`❌ Error leyendo el archivo SQL:`, error);
    return;
  }
  
  // Ejecutar el script SQL
  const success = await executeSQL(sqlScript, 'configurar la base de datos');
  
  if (success) {
    console.log('✅ Base de datos configurada correctamente');
    
    // Verificar si se crearon las tablas principales
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('❌ Error verificando la tabla de perfiles:', profilesError);
      } else {
        console.log(`ℹ️ Tabla de perfiles creada. Registros existentes: ${profiles?.length || 0}`);
      }
    } catch (error) {
      console.error('❌ Error verificando la tabla de perfiles:', error);
    }
    
    try {
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*');
        
      if (accountsError) {
        console.error('❌ Error verificando la tabla de cuentas:', accountsError);
      } else {
        console.log(`ℹ️ Tabla de cuentas creada. Registros existentes: ${accounts?.length || 0}`);
      }
    } catch (error) {
      console.error('❌ Error verificando la tabla de cuentas:', error);
    }
  } else {
    console.error('❌ Error configurando la base de datos');
  }
}

// Iniciar el proceso
initializeSupabase().catch(error => {
  console.error('Error en la inicialización:', error);
  process.exit(1);
});