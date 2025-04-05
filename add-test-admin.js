// Script para agregar un usuario administrador de prueba en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

// Crear un cliente de Supabase con las credenciales de admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para hashear contraseña
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function addTestAdmin() {
  console.log('Intentando agregar un administrador de prueba...');
  
  // Hashear la contraseña
  const hashedPassword = await hashPassword('admin123');
  
  const testAdmin = {
    username: 'admin',
    email: 'admin@efectivio.com',
    password: hashedPassword,
    fullname: 'Administrador de Prueba',
    role: 'administrador_sistema',
    is_active: true
  };
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(testAdmin)
      .select()
      .single();
    
    if (error) {
      console.error('Error al insertar administrador:', error);
      return;
    }
    
    console.log('Administrador añadido exitosamente:', data);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
}

addTestAdmin();