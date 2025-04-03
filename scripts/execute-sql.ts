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
 * Ejecuta una instrucción SQL directamente a través de la API REST
 */
async function executeSQLViaREST(sql: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey || ''}`,
      'apikey': supabaseServiceKey || '',
      'Prefer': 'resolution=merge-duplicates'
    };

    // Ejecutar SQL directamente a través de la API REST
    const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error ejecutando SQL:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al ejecutar SQL mediante API REST:', error);
    return false;
  }
}

/**
 * Procesa un archivo SQL y lo ejecuta línea por línea
 */
async function processSQLFile(filePath: string) {
  console.log(`Procesando archivo SQL: ${filePath}`);

  let sqlContent: string;
  try {
    sqlContent = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error al leer el archivo SQL ${filePath}:`, error);
    return false;
  }

  // Dividir el SQL en instrucciones individuales
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`Se encontraron ${statements.length} instrucciones SQL para ejecutar`);

  // Ejecutar cada instrucción individualmente
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    process.stdout.write(`Ejecutando instrucción ${i + 1}/${statements.length}... `);
    
    try {
      // Intentamos primero usar la API de Supabase para ejecutar SQL
      let success = false;
      
      try {
        const { error } = await supabase.rpc('pg_execute', { query: statement });
        if (!error) {
          success = true;
        } else if (error.message.includes('does not exist') && error.message.includes('function')) {
          console.log('Función pg_execute no disponible, usando API REST');
          success = await executeSQLViaREST(statement);
        } else {
          console.error(`Error: ${error.message}`);
        }
      } catch (error: any) {
        if (error.message?.includes('does not exist') && error.message?.includes('function')) {
          console.log('Función pg_execute no disponible, usando API REST');
          success = await executeSQLViaREST(statement);
        } else {
          console.error(`Error: ${error.message}`);
          success = false;
        }
      }
      
      if (success) {
        console.log('✅');
      } else {
        console.log('❌');
        
        // Si la instrucción es de creación y falla, probablemente ya exista
        if (statement.toLowerCase().includes('create table') && statement.toLowerCase().includes('if not exists')) {
          console.log('  (La tabla probablemente ya existe, continuando...)');
        } else {
          console.log('  SQL que falló:', statement);
          
          // Preguntar si desea continuar
          const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          const answer = await new Promise<string>(resolve => {
            rl.question('¿Desea continuar con la siguiente instrucción? (s/n): ', resolve);
          });
          
          rl.close();
          
          if (answer.toLowerCase() !== 's') {
            console.log('Ejecución detenida por el usuario');
            return false;
          }
        }
      }
    } catch (error) {
      console.log('❌');
      console.error('  Error al ejecutar la instrucción:', error);
      return false;
    }
  }

  return true;
}

/**
 * Punto de entrada principal
 */
async function main() {
  console.log('🚀 Iniciando ejecución de SQL en Supabase...\n');

  // Verificar primero si podemos conectar a Supabase
  try {
    // Probar una consulta sencilla para verificar la conexión
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.error('Error conectando con Supabase:', error.message);
      console.log('Verifica tus credenciales de Supabase.');
      return;
    }
    
    console.log('✅ Conectado a Supabase correctamente\n');
  } catch (error: any) {
    console.error('Error al verificar la conexión a Supabase:', error.message);
    return;
  }

  // Ejecutar el archivo SQL principal
  const sqlFilePath = path.join(__dirname, 'init-supabase.sql');
  const success = await processSQLFile(sqlFilePath);

  if (success) {
    console.log('\n✅ Script SQL ejecutado correctamente');
  } else {
    console.error('\n❌ Hubo errores al ejecutar el script SQL');
  }
}

main().catch(error => {
  console.error('Error en la ejecución del script:', error);
  process.exit(1);
});