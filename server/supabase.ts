import { createClient } from '@supabase/supabase-js';

// Definir buckets de almacenamiento
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  INVOICES: 'invoices',
  RECEIPTS: 'receipts',
  CONTRACTS: 'contracts',
  PROFILES: 'profiles',
  AVATARS: 'avatars'
};

// Utilidad para obtener un cliente de Supabase con las credenciales del servidor
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Las variables de entorno de Supabase no están configuradas');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Función para verificar el acceso al bucket y crearlo si no existe
export async function ensureStorageBucket(bucketName: string, isPublic: boolean = false) {
  try {
    const supabase = getSupabaseClient();
    
    // Verificar si el bucket existe
    const { data: buckets, error: getBucketError } = await supabase.storage.listBuckets();
    
    if (getBucketError) {
      console.error('Error al listar buckets:', getBucketError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Crear bucket si no existe
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });
      
      if (createBucketError) {
        console.error(`Error al crear bucket ${bucketName}:`, createBucketError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} creado correctamente`);
    }
    
    return true;
  } catch (error) {
    console.error('Error al verificar/crear bucket:', error);
    return false;
  }
}

// Función para inicializar todos los buckets de almacenamiento
export async function initializeStorageBuckets(): Promise<void> {
  for (const bucketName of Object.values(STORAGE_BUCKETS)) {
    const isPublic = bucketName === STORAGE_BUCKETS.PROFILES || bucketName === STORAGE_BUCKETS.AVATARS;
    await ensureStorageBucket(bucketName, isPublic);
  }
}

// Función para crear una ruta de archivo
export function createFilePath(userId: string, clientId: number | null, category: string, fileName: string): string {
  const segments = [];
  
  // Agregar ID de usuario
  segments.push(`user_${userId}`);
  
  // Agregar ID de cliente si existe
  if (clientId) {
    segments.push(`client_${clientId}`);
  }
  
  // Agregar categoría
  segments.push(category);
  
  // Agregar timestamp para evitar colisiones
  const timestamp = Date.now();
  
  // Crear nombre de archivo limpio (evitar caracteres problemáticos)
  const cleanFileName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Construir ruta final: user_123/client_456/invoices/timestamp_filename.pdf
  return `${segments.join('/')}/${timestamp}_${cleanFileName}`;
}

// Función para subir un archivo a Supabase Storage
export async function uploadFile(
  bucket: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    
    // Asegurar que el bucket existe
    await ensureStorageBucket(bucket);
    
    // Subir archivo
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      });
    
    if (error) {
      console.error('Error al subir archivo:', error);
      return null;
    }
    
    // Obtener URL pública o firmada
    if (bucket === STORAGE_BUCKETS.PROFILES || bucket === STORAGE_BUCKETS.AVATARS) {
      // Perfiles y avatares son públicos
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } else {
      // Otros archivos usan URLs firmadas
      return await getSignedUrl(bucket, filePath);
    }
  } catch (error) {
    console.error('Error en uploadFile:', error);
    return null;
  }
}

// Función para obtener una URL firmada
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Error al crear URL firmada:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error en getSignedUrl:', error);
    return null;
  }
}

// Función para listar archivos en un bucket
export async function listFiles(bucket: string, prefix?: string): Promise<any[]> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix || '');
    
    if (error) {
      console.error('Error al listar archivos:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error en listFiles:', error);
    return [];
  }
}

// Función para eliminar un archivo
export async function deleteFile(bucket: string, filePath: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Error al eliminar archivo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en deleteFile:', error);
    return false;
  }
}