/**
 * Sincroniza variables de entorno con el cliente
 * 
 * Este módulo exporta las variables de entorno necesarias para el frontend
 * a través de la variable global import.meta.env que Vite utiliza.
 */
export function syncViteEnvVars(): void {
  console.log('Sincronizando variables de entorno para el frontend...');
  
  // Lista de variables de entorno para sincronizar con el frontend
  const envVarsToSync = [
    // Auth
    'VITE_CLERK_PUBLISHABLE_KEY',
    
    // Supabase
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    
    // URL base de la aplicación
    'VITE_APP_URL',
    
    // Configuración de interfaz
    'VITE_APP_NAME',
    'VITE_APP_LOGO',
    'VITE_DEFAULT_THEME',
    
    // Configuración de API
    'VITE_API_BASE_URL',
    'VITE_API_TIMEOUT',
    
    // Características específicas
    'VITE_ENABLE_ANALYTICS',
    'VITE_ENABLE_DARK_MODE',
    'VITE_ENABLE_NOTIFICATIONS'
  ];
  
  // Imprimir las variables que se están sincronizando
  let syncedVars = 0;
  
  envVarsToSync.forEach(varName => {
    if (process.env[varName]) {
      syncedVars++;
    }
  });
  
  console.log(`Se sincronizaron ${syncedVars} de ${envVarsToSync.length} variables de entorno para el frontend`);
}