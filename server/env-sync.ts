import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Sincroniza las variables de entorno regulares a sus equivalentes VITE
 */
export function syncViteEnvVars() {
  // Carga las variables de entorno del archivo .env.local
  dotenv.config({ path: '.env.local' });
  
  // Variables que deben ser accesibles en el cliente (frontend)
  const clientEnvVars = [
    {
      source: 'SUPABASE_URL',
      target: 'VITE_SUPABASE_URL'
    },
    {
      source: 'SUPABASE_ANON_KEY',
      target: 'VITE_SUPABASE_ANON_KEY'
    },
    {
      source: 'CLERK_PUBLISHABLE_KEY',
      target: 'VITE_CLERK_PUBLISHABLE_KEY'
    },
    {
      source: 'HUGGINGFACE_API_KEY',
      target: 'VITE_HUGGINGFACE_API_KEY'
    }
  ];
  
  // Comprueba y copia las variables cliente al objeto process.env con el prefijo VITE_
  let missingVars = false;
  clientEnvVars.forEach(({ source, target }) => {
    if (process.env[source]) {
      process.env[target] = process.env[source];
    } else {
      console.warn(`⚠️ Variable de entorno ${source} no está definida, ${target} no estará disponible`);
      missingVars = true;
    }
  });
  
  // Si faltan variables necesarias, notifica pero no detiene la ejecución
  if (missingVars) {
    console.warn('⚠️ Algunas variables de entorno no están definidas. Es posible que ciertas funcionalidades no trabajen correctamente.');
  }
  
  // También actualiza el archivo .env.local si falta alguna variable VITE_
  let envContent = '';
  try {
    envContent = fs.readFileSync('.env.local', 'utf8');
  } catch (error) {
    console.warn('No se pudo leer el archivo .env.local, creando uno nuevo');
    envContent = '';
  }
  
  let envChanged = false;
  
  // Agrega las variables VITE_ al archivo .env.local si no existen ya
  clientEnvVars.forEach(({ source, target }) => {
    if (process.env[source] && !envContent.includes(`${target}=`)) {
      envContent += `\n${target}=${process.env[source]}`;
      envChanged = true;
    }
  });
  
  // Guarda los cambios en el archivo .env.local
  if (envChanged) {
    try {
      fs.writeFileSync('.env.local', envContent);
      console.log('✅ Archivo .env.local actualizado con variables VITE_');
    } catch (error) {
      console.error('❌ Error al escribir en .env.local:', error);
    }
  }
}

// Ejecuta la sincronización al importar este módulo
syncViteEnvVars();