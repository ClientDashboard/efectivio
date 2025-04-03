import { createClient } from '@supabase/supabase-js';

// Definir buckets de almacenamiento
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  INVOICES: 'invoices',
  RECEIPTS: 'receipts',
  CONTRACTS: 'contracts',
  PROFILES: 'profiles',
  MEETING_RECORDINGS: 'meeting_recordings'
};

// Verificar que las variables de entorno estén definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en las variables de entorno');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio para operaciones del servidor
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Crea un cliente de Supabase para un usuario específico usando su token JWT
 * @param jwt Token JWT del usuario
 * @returns Cliente de Supabase autenticado como el usuario
 */
export function createSupabaseClientWithToken(jwt: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    }
  );
}

/**
 * Inicializa los buckets de almacenamiento necesarios si no existen
 */
export async function initializeStorageBuckets() {
  const buckets = [
    { name: 'documents', public: false },
    { name: 'invoices', public: false },
    { name: 'receipts', public: false },
    { name: 'contracts', public: false },
    { name: 'profiles', public: true },
    { name: 'meeting_recordings', public: false }
  ];

  for (const bucket of buckets) {
    const { data, error } = await supabaseAdmin.storage.getBucket(bucket.name);
    
    if (error && error.message.includes('The resource was not found')) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.name === 'meeting_recordings' ? 1024 * 1024 * 100 : 1024 * 1024 * 10, // 100MB para grabaciones, 10MB para otros
        allowedMimeTypes: bucket.name === 'profiles' 
          ? ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'] 
          : undefined
      });
      
      if (createError) {
        console.error(`Error al crear bucket ${bucket.name}:`, createError);
      } else {
        console.log(`✅ Bucket ${bucket.name} creado correctamente`);
      }
    } else if (error) {
      console.error(`Error al verificar bucket ${bucket.name}:`, error);
    } else {
      console.log(`ℹ️ Bucket ${bucket.name} ya existe`);
    }
  }
}

/**
 * Crea y estructura una ruta de archivo para un usuario específico
 * @param userId ID del usuario
 * @param clientId ID del cliente (opcional)
 * @param category Categoría del archivo
 * @param filename Nombre del archivo
 * @returns Ruta estructurada del archivo
 */
export function createFilePath(userId: string, clientId: number | null, category: string, filename: string): string {
  let path = userId;
  
  if (clientId) {
    path += `/${clientId}`;
  }
  
  path += `/${category}/${Date.now()}_${filename}`;
  
  return path;
}

/**
 * Sube un archivo al storage de Supabase
 * @param bucketName Nombre del bucket
 * @param filePath Ruta del archivo en el bucket
 * @param file Buffer o string del archivo
 * @param contentType Tipo MIME del archivo
 * @returns URL pública del archivo o undefined si hay error
 */
export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: Buffer | string,
  contentType: string
): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType,
      upsert: true
    });
    
  if (error) {
    console.error(`Error al subir archivo a ${bucketName}/${filePath}:`, error);
    return undefined;
  }
  
  // Obtener URL pública si el bucket es público, o URL firmada si es privado
  let url: string;
  if (bucketName === 'profiles') {
    const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
    url = data.publicUrl;
  } else {
    // URL firmada con expiración de 60 minutos para buckets privados
    const { data } = await supabaseAdmin.storage.from(bucketName).createSignedUrl(filePath, 60 * 60);
    url = data?.signedUrl || '';
  }
  
  return url;
}

/**
 * Elimina un archivo del storage de Supabase
 * @param bucketName Nombre del bucket
 * @param filePath Ruta del archivo en el bucket
 * @returns true si se eliminó correctamente, false si hubo error
 */
export async function deleteFile(bucketName: string, filePath: string): Promise<boolean> {
  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .remove([filePath]);
    
  if (error) {
    console.error(`Error al eliminar archivo de ${bucketName}/${filePath}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Obtiene una URL firmada para un archivo en Supabase Storage
 * @param bucketName Nombre del bucket
 * @param filePath Ruta del archivo
 * @param expiresIn Tiempo de expiración en segundos (por defecto 1 hora)
 * @returns URL firmada o undefined si hay error
 */
export async function getSignedUrl(
  bucketName: string,
  filePath: string,
  expiresIn = 60 * 60
): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn);
    
  if (error) {
    console.error(`Error al generar URL firmada para ${bucketName}/${filePath}:`, error);
    return undefined;
  }
  
  return data.signedUrl;
}

/**
 * Obtiene una lista de archivos en un bucket para un usuario/cliente específico
 * @param bucketName Nombre del bucket
 * @param userId ID del usuario
 * @param clientId ID del cliente (opcional)
 * @returns Lista de archivos o undefined si hay error
 */
export async function listFiles(
  bucketName: string,
  userId: string,
  clientId?: number
): Promise<any[] | undefined> {
  let path = `${userId}`;
  
  if (clientId) {
    path += `/${clientId}`;
  }
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .list(path);
    
  if (error) {
    console.error(`Error al listar archivos en ${bucketName}/${path}:`, error);
    return undefined;
  }
  
  return data;
}

/**
 * Descarga un archivo del storage de Supabase
 * @param bucketName Nombre del bucket
 * @param filePath Ruta del archivo en el bucket
 * @returns Buffer del archivo o undefined si hay error
 */
export async function downloadFile(
  bucketName: string,
  filePath: string
): Promise<Buffer | undefined> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .download(filePath);
    
  if (error) {
    console.error(`Error al descargar archivo de ${bucketName}/${filePath}:`, error);
    return undefined;
  }
  
  return Buffer.from(await data.arrayBuffer());
}