import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de las variables de entorno
const supabaseUrl = import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas. Algunas funciones pueden no funcionar correctamente.');
}

// Cliente para operaciones de usuario normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones administrativas (con privilegios elevados)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
