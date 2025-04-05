// Script para agregar un cliente de prueba directamente en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Crear un cliente de Supabase con las credenciales de admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addTestClient() {
  console.log('Intentando agregar un cliente de prueba...');
  
  const testClient = {
    name: 'Solar Mente',
    client_type: 'company',
    company_name: 'Solar Mente',
    display_name: 'Solar Mente',
    email: 'ventas@solarmente.io',
    work_phone: '+1234567890',
    address: 'Avenida del Sol 456',
    city: 'Ciudad Solar',
    state: 'Estado Renovable',
    country: 'México',
    tax_id: 'B87654321',
    payment_terms: '30_days',
    has_portal_access: true,
    notes: 'Empresa de energía solar y renovable',
    is_active: true
  };
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();
    
    if (error) {
      console.error('Error al insertar cliente:', error);
      return;
    }
    
    console.log('Cliente añadido exitosamente:', data);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
}

addTestClient();