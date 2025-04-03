/**
 * Este script sincroniza las variables de entorno de Supabase con sus equivalentes VITE
 * para asegurar que el frontend tenga acceso a las mismas variables que el backend.
 */

// Mapeo de variables de entorno regulares a sus equivalentes VITE
const ENV_MAPPING = {
  'SUPABASE_URL': 'VITE_SUPABASE_URL',
  'SUPABASE_ANON_KEY': 'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY': 'VITE_SUPABASE_SERVICE_ROLE_KEY'
};

/**
 * Sincroniza las variables de entorno regulares a sus equivalentes VITE
 */
export function syncViteEnvVars() {
  console.log('Sincronizando variables de entorno para VITE...');
  
  Object.entries(ENV_MAPPING).forEach(([source, target]) => {
    if (process.env[source] && !process.env[target]) {
      process.env[target] = process.env[source];
      console.log(`✓ Sincronizada variable: ${source} -> ${target}`);
    }
  });
}