import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de Supabase de las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en las variables de entorno');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de rol de servicio para tener privilegios de administrador
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function initializeSupabase() {
  try {
    console.log('Iniciando la configuración de Supabase...');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'supabase-init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Ejecutar el SQL en Supabase
    const { error } = await supabase.rpc('pgexec', { command: sqlContent });

    if (error) {
      console.error('Error al ejecutar SQL:', error);
      return;
    }

    console.log('¡Configuración de Supabase completada exitosamente!');
  } catch (error) {
    console.error('Error durante la inicialización de Supabase:', error);
  }
}

// Ejecutar la función principal
initializeSupabase();