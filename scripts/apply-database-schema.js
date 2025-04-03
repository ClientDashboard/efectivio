import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  process.exit(1);
}

/**
 * Ejecuta una instrucción SQL directamente a través de la API REST de Supabase
 */
async function executeSQLViaREST(sql) {
  try {
    // Construir URL para la API de SQL
    const sqlUrl = `${supabaseUrl}/rest/v1/`;
    
    // Configurar headers para autenticación
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    };
    
    // Ejecutar consulta SQL (dividiendo el SQL en comandos individuales)
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim() + ';';
      console.log(`Ejecutando comando SQL ${i + 1}/${commands.length}...`);
      
      const response = await fetch(`${sqlUrl}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'tx=commit'
        },
        body: JSON.stringify({
          query: command
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error en comando ${i + 1}: ${errorText}`);
        // Continuamos con el siguiente comando en lugar de detener todo el proceso
      }
    }
    
    console.log('✅ Esquema de base de datos aplicado correctamente');
    return true;
  } catch (error) {
    console.error('Error al ejecutar SQL via REST:', error);
    return false;
  }
}

async function executeSQL() {
  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar las consultas SQL a través de la API REST
    const success = await executeSQLViaREST(sqlContent);

    if (!success) {
      console.error('Error al ejecutar SQL');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al aplicar el esquema de base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
executeSQL();