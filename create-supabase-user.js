import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Crear un cliente de Supabase con las credenciales de administrador
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSupabaseUser() {
  console.log('Creando usuario en Supabase Auth...');
  
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error('Error al buscar usuarios:', searchError);
      return;
    }
    
    const adminExists = existingUser.users.find(user => user.email === 'admin@efectivio.com');
    
    if (adminExists) {
      console.log('✅ El usuario admin ya existe en Supabase Auth:', adminExists);
      return;
    }
    
    // Crear el usuario
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@efectivio.com',
      password: 'Contrasena123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Principal',
        username: 'admin',
        role: 'administrador_sistema'
      }
    });
    
    if (error) {
      console.error('Error al crear usuario en Supabase:', error);
      return;
    }
    
    console.log('✅ Usuario creado exitosamente en Supabase Auth:', data);
    
    // Verificar que el usuario se haya creado
    const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(data.user.id);
    
    if (fetchError) {
      console.error('Error al obtener usuario recién creado:', fetchError);
      return;
    }
    
    console.log('Detalles del usuario:');
    console.log('ID:', userData.user.id);
    console.log('Email:', userData.user.email);
    console.log('Metadata:', userData.user.user_metadata);
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

createSupabaseUser();