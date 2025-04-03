import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env.local');
  process.exit(1);
}

// Crear cliente de Supabase con permisos de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Verifica si podemos acceder a Supabase y muestra información sobre la conexión
 */
async function checkSupabaseConnection() {
  try {
    // Intentar una consulta simple
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Error conectando con Supabase:', error.message);
      console.log('Por favor verifica tus credenciales de Supabase.');
      return false;
    }
    
    console.log('✅ Conexión a Supabase establecida correctamente');
    
    // Verificar si algunas tablas ya existen
    await checkTable('profiles', 'perfiles');
    await checkTable('clients', 'clientes');
    await checkTable('invoices', 'facturas');
    await checkTable('accounts', 'cuentas');
    
    return true;
  } catch (error: any) {
    console.error('❌ Error al verificar la conexión a Supabase:', error.message);
    return false;
  }
}

/**
 * Verifica si una tabla existe
 */
async function checkTable(tableName: string, displayName: string) {
  try {
    const { error } = await supabase.from(tableName).select('count').limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`ℹ️ La tabla de ${displayName} no existe todavía`);
      } else {
        console.error(`❌ Error al verificar la tabla de ${displayName}:`, error.message);
      }
    } else {
      console.log(`✅ La tabla de ${displayName} ya existe`);
    }
  } catch (error: any) {
    console.error(`❌ Error al verificar la tabla de ${displayName}:`, error.message);
  }
}

/**
 * Verifica si tenemos buckets de almacenamiento
 */
async function checkStorageBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error al verificar los buckets de almacenamiento:', error.message);
      return;
    }
    
    console.log(`ℹ️ Buckets encontrados: ${data.length}`);
    data.forEach(bucket => {
      console.log(`  - ${bucket.name}`);
    });
    
    // Buckets que deberíamos tener
    const requiredBuckets = ['documents', 'invoices', 'receipts', 'contracts', 'profiles', 'meeting_recordings'];
    const existingBuckets = data.map(b => b.name);
    
    const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
    
    if (missingBuckets.length > 0) {
      console.log(`ℹ️ Buckets faltantes: ${missingBuckets.join(', ')}`);
    } else {
      console.log('✅ Todos los buckets necesarios existen');
    }
  } catch (error: any) {
    console.error('❌ Error al verificar los buckets de almacenamiento:', error.message);
  }
}

/**
 * Muestra información sobre el servidor de Supabase
 */
async function showSupabaseInfo() {
  console.log('\n📊 Información de Supabase:');
  console.log(`URL: ${supabaseUrl}`);
  
  // Verificar que la clave de servicio no sea sospechosa (debería ser larga)
  if (supabaseServiceKey && supabaseServiceKey.length > 20) {
    console.log('Service Key: ********' + supabaseServiceKey.substring(supabaseServiceKey.length - 8));
  } else {
    console.log('⚠️ Service Key: Parece inválida (demasiado corta)');
  }
}

async function main() {
  console.log('🔍 Verificando configuración de Supabase...\n');
  
  await showSupabaseInfo();
  
  const connected = await checkSupabaseConnection();
  if (!connected) {
    console.error('\n❌ No se pudo conectar a Supabase. Verifica las credenciales.');
    return;
  }
  
  await checkStorageBuckets();
  
  console.log('\n💡 Sugerencias:');
  console.log('1. Si faltan tablas, ejecuta el script SQL: npx tsx scripts/execute-sql.ts');
  console.log('2. Si faltan buckets, ejecútalos: npx tsx scripts/create-buckets.ts');
}

main().catch(error => {
  console.error('Error en la verificación:', error);
  process.exit(1);
});