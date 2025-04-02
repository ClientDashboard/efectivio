import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de las variables de entorno (con el prefijo VITE_ para el frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// Nota: No deberíamos usar la clave de service role en el frontend por seguridad
// Solo se usa aquí para el desarrollo, en producción debería gestionarse desde el backend
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas. Algunas funciones pueden no funcionar correctamente.');
}

// Cliente para operaciones de usuario normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones administrativas (con privilegios elevados)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
