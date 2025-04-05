// Script para agregar una configuración de marca blanca para Solar Mente
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Crear un cliente de Supabase con las credenciales de admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addWhiteLabel() {
  console.log('Intentando agregar configuración de marca blanca para Solar Mente...');
  
  // Primero buscamos el id del cliente
  let clientId = null;
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id')
      .eq('email', 'ventas@solarmente.io')
      .single();
    
    if (error) {
      console.error('Error al buscar el cliente:', error);
    } else if (clients) {
      clientId = clients.id;
      console.log('ID del cliente Solar Mente encontrado:', clientId);
    }
  } catch (error) {
    console.error('Error al buscar el cliente:', error);
  }
  
  const whiteLabelConfig = {
    company_name: 'Solar Mente',
    domain: 'solarmente.io',
    primary_color: '#2E7D32', // Verde oscuro para una empresa de energía solar
    logo_url: null, // Se podría añadir un logo posteriormente
    favicon_url: null,
    footer_text: '© 2025 Solar Mente - Energía Renovable',
    enable_powered_by: true,
    is_active: true,
    client_id: clientId, // Asociamos con el cliente si lo encontramos
    contact_email: 'ventas@solarmente.io',
    contact_phone: '+1234567890',
    additional_css: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('white_label')
      .insert(whiteLabelConfig)
      .select()
      .single();
    
    if (error) {
      console.error('Error al insertar configuración de marca blanca:', error);
      return;
    }
    
    console.log('Configuración de marca blanca añadida exitosamente:', data);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  }
}

addWhiteLabel();