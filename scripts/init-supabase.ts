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

// Estas funciones ya no se necesitan - ahora usamos el enfoque direct SQL

/**
 * Ejecuta SQL directamente usando la API REST de Supabase
 * @param sql Consulta SQL a ejecutar
 * @returns Promise<boolean> true si la operación fue exitosa
 */
async function executeSQLDirect(sql: string): Promise<boolean> {
  try {
    // Dividir el script en instrucciones individuales
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`ℹ️ Ejecutando ${statements.length} instrucciones SQL...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      
      // Usar la API REST de PostgreSQL para ejecutar SQL directamente
      const { data, error } = await supabase.rpc('pg_execute', { 
        query: statement 
      });
      
      if (error) {
        console.error(`Error ejecutando SQL (${i+1}/${statements.length}):`, error);
        console.log('SQL que causó el error:', statement);
        
        // Si es un error de tabla ya existe, continuamos
        if (error.message?.includes('already exists')) {
          console.log('La tabla ya existe, continuando...');
          continue;
        }
        
        // Para otros errores, detenemos la ejecución
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error al ejecutar SQL:', error);
    return false;
  }
}

/**
 * Inicializa la base de datos de Supabase con el esquema requerido
 */
async function initializeSupabase() {
  console.log('🚀 Iniciando configuración de Supabase...');
  
  // Primero verificar si podemos acceder a Supabase
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  
  if (error && !error.message.includes('does not exist')) {
    console.error('❌ Error conectando con Supabase:', error);
    console.log('Por favor verifica tus credenciales de Supabase.');
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
  
  // Crear primero la función pg_execute para ejecutar SQL
  const createPgExecuteSQL = `
    CREATE OR REPLACE FUNCTION pg_execute(query text) RETURNS json AS $$
    DECLARE
      result json;
    BEGIN
      EXECUTE query;
      result := '{"success": true}'::json;
      RETURN result;
    EXCEPTION WHEN OTHERS THEN
      result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
      );
      RETURN result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // Intentamos crear la función pg_execute a través de la API REST
  console.log('Creando función pg_execute...');
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey || ''}`,
      'apikey': supabaseServiceKey || ''
    };
  
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: createPgExecuteSQL })
    });
    
    if (!response.ok) {
      // Si la función no existe, la creamos usando SQL directo
      console.log('La función pg_execute no existe, creándola con SQL directo...');
      
      const createHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey || ''}`,
        'apikey': supabaseServiceKey || '',
        'Prefer': 'return=minimal'
      };
      
      const createFunctionResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: createHeaders,
        body: JSON.stringify({
          query: createPgExecuteSQL
        })
      });
      
      if (!createFunctionResponse.ok) {
        console.error('❌ No se pudo crear la función pg_execute');
        return;
      }
    }
  } catch (error) {
    console.error('Error al crear la función pg_execute:', error);
    return;
  }
  
  console.log('✅ Función pg_execute disponible');
  
  // Ejecutar el script SQL
  console.log('Ejecutando script SQL...');
  const success = await executeSQLDirect(sqlScript);
  
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