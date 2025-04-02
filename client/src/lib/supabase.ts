import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de las variables de entorno en el cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas. Algunas funciones pueden no funcionar correctamente.');
}

// Cliente para operaciones de usuario normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones administrativas (con privilegios elevados)
// Nota: Este cliente no se debería usar directamente en el frontend
// Se incluye aquí solo para desarrollo y depuración
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);