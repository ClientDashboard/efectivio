import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de las variables de entorno en el backend
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas en el servidor. Algunas funciones pueden no funcionar correctamente.');
}

// Cliente para operaciones de usuario normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones administrativas (con privilegios elevados)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);