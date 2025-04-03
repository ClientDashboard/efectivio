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
 * Crea un bucket de almacenamiento si no existe
 */
async function createBucketIfNotExists(name: string, isPublic: boolean = false) {
  try {
    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Error al listar buckets:`, listError.message);
      return false;
    }
    
    const bucketExists = buckets.some(b => b.name === name);
    
    if (bucketExists) {
      console.log(`ℹ️ Bucket ${name} ya existe`);
      return true;
    }
    
    // Si no existe, crearlo
    const { data, error } = await supabase.storage.createBucket(name, {
      public: isPublic,
      fileSizeLimit: 52428800 // 50MB en bytes
    });
    
    if (error) {
      console.error(`Error al crear bucket ${name}:`, error.message);
      return false;
    }
    
    console.log(`✅ Bucket ${name} creado correctamente`);
    return true;
  } catch (error: any) {
    console.error(`Error al crear bucket ${name}:`, error.message);
    return false;
  }
}

/**
 * Configura las políticas de acceso para los buckets
 * Nota: En versiones recientes de Supabase, las políticas se configuran directamente en la creación del bucket
 */
async function setupBucketPolicies(bucketName: string, isPublic: boolean = false) {
  try {
    // En versiones actuales de Supabase, las políticas se establecen al crear el bucket
    // Esta función queda como referencia, pero en realidad no hace nada adicional
    if (isPublic) {
      console.log(`ℹ️ El bucket ${bucketName} ya está configurado como público`);
    } else {
      console.log(`ℹ️ El bucket ${bucketName} está configurado con acceso privado`);
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error al verificar políticas para ${bucketName}:`, error.message);
    return false;
  }
}

/**
 * Función principal para crear todos los buckets necesarios
 */
async function createAllBuckets() {
  console.log('🚀 Creando buckets de almacenamiento en Supabase...\n');
  
  // Verificar primero si podemos conectar a Supabase
  try {
    // Intentamos listar buckets para ver si tenemos acceso
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error conectando con Supabase:', error.message);
      console.log('Verifica tus credenciales de Supabase.');
      return;
    }
    
    console.log('✅ Conectado a Supabase correctamente\n');
  } catch (error: any) {
    console.error('Error al verificar la conexión a Supabase:', error.message);
    return;
  }
  
  // Lista de buckets a crear
  const buckets = [
    { name: 'documents', public: false },     // Documentos generales
    { name: 'invoices', public: false },      // Facturas
    { name: 'receipts', public: false },      // Recibos
    { name: 'contracts', public: false },     // Contratos
    { name: 'profiles', public: true },       // Imágenes de perfil (públicas)
    { name: 'meeting_recordings', public: false } // Grabaciones de reuniones
  ];
  
  // Crear cada bucket
  for (const bucket of buckets) {
    const success = await createBucketIfNotExists(bucket.name, bucket.public);
    
    if (success) {
      await setupBucketPolicies(bucket.name, bucket.public);
    }
  }
  
  console.log('\n✅ Proceso de creación de buckets completado');
}

// Ejecutar la función principal
createAllBuckets().catch(error => {
  console.error('Error en la creación de buckets:', error);
  process.exit(1);
});