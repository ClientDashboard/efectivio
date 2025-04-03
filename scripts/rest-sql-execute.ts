import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// En ESM, __dirname no está definido, así que lo creamos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env.local');
  process.exit(1);
}

/**
 * Ejecuta un script SQL a través de la API REST
 */
async function executeSQLScript(sqlFilePath: string) {
  // Leer el archivo SQL
  console.log(`Leyendo archivo SQL: ${sqlFilePath}`);
  let sqlContent: string;
  
  try {
    sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  } catch (error) {
    console.error(`Error al leer el archivo SQL:`, error);
    return false;
  }
  
  console.log(`Archivo SQL leído correctamente (${sqlContent.length} caracteres)`);
  
  // Dividir el SQL en instrucciones individuales
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  console.log(`Ejecutando ${statements.length} instrucciones SQL...`);
  
  // Definir las cabeceras para la solicitud REST
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseServiceKey || ''}`,
    'apikey': supabaseServiceKey || '',
    'Prefer': 'resolution=merge-duplicates',
  };
  
  // Ejecutar cada instrucción individualmente
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\nInstrucción ${i + 1}/${statements.length}`);
    
    try {
      // Solicitud a la API REST
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: statement })
      });
      
      if (response.ok) {
        console.log('✅ Ejecutada correctamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error ejecutando la instrucción:');
        console.error(`Status: ${response.status} ${response.statusText}`);
        console.error('Respuesta:', errorText);
        
        // Si es una instrucción de CREATE y contiene IF NOT EXISTS, es posible que falle por
        // que el objeto ya existe, lo cual es aceptable
        if (
          statement.toUpperCase().includes('CREATE') && 
          statement.toUpperCase().includes('IF NOT EXISTS')
        ) {
          console.log('⚠️ Es posible que el objeto ya exista, continuando...');
          continue;
        }
        
        // Preguntar si desea continuar
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const continuar = await new Promise<string>(resolve => {
          readline.question('¿Desea continuar con la siguiente instrucción? (s/n): ', resolve);
        });
        
        readline.close();
        
        if (continuar.toLowerCase() !== 's') {
          console.log('Ejecución detenida por el usuario');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Error al enviar la solicitud:', error);
      return false;
    }
  }
  
  console.log('\n✅ Script SQL ejecutado completamente');
  return true;
}

// Ejecutar el script principal
async function main() {
  console.log('🚀 Ejecutando SQL en Supabase mediante API REST...\n');
  
  // Verificar primero si tenemos acceso a Supabase
  try {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${supabaseServiceKey || ''}`,
      'apikey': supabaseServiceKey || ''
    };
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      console.error(`❌ Error accediendo a Supabase: ${response.status} ${response.statusText}`);
      console.log('Verifica tus credenciales de Supabase');
      return;
    }
    
    console.log('✅ Conexión a Supabase verificada\n');
  } catch (error) {
    console.error('❌ Error accediendo a Supabase:', error);
    return;
  }
  
  // Ejecutar el script SQL
  const sqlFilePath = path.join(__dirname, 'init-supabase.sql');
  await executeSQLScript(sqlFilePath);
}

main().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});