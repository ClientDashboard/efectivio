import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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

// Constantes para buckets de almacenamiento
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  INVOICES: 'invoices',
  RECEIPTS: 'receipts',
  CONTRACTS: 'contracts',
  PROFILES: 'profiles',
  BACKUPS: 'backups',
};

// Función para inicializar los buckets de almacenamiento
export const initializeStorageBuckets = async () => {
  try {
    // Crear los buckets si no existen
    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      const { data: existingBucket, error: checkError } = await supabaseAdmin
        .storage
        .getBucket(bucketName);
      
      if (checkError && !existingBucket) {
        const { data, error } = await supabaseAdmin
          .storage
          .createBucket(bucketName, {
            public: false,
            fileSizeLimit: 10485760, // 10MB por defecto
          });
          
        if (error) {
          console.error(`Error creando bucket ${bucketName}:`, error);
        } else {
          console.log(`Bucket ${bucketName} creado correctamente.`);
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando buckets de almacenamiento:', error);
  }
};

// Función para subir un archivo a Supabase Storage
export const uploadFile = async ({ 
  bucket, 
  file, 
  path = '',
  contentType,
  clientId,
  userId,
  category
}: { 
  bucket: string; 
  file: Buffer; 
  path?: string;
  contentType: string;
  clientId?: number;
  userId: string;
  category: string;
}) => {
  try {
    // Crear un nombre de archivo único
    const filename = `${path ? path + '/' : ''}${Date.now()}_${randomUUID()}`;
    
    // Subir el archivo
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .upload(filename, file, {
        contentType,
        upsert: false,
      });
      
    if (error) {
      throw error;
    }
    
    // Obtener URL pública (si es necesario)
    const { data: urlData } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(filename, 60 * 60 * 24 * 7); // URL válida por 7 días
      
    // Guardar referencia en la tabla files
    const fileReference = {
      name: filename,
      path: data.path,
      size: file.length,
      mimeType: contentType,
      clientId,
      userId,
      category
    };
    
    // Utilizar PostgreSQL directamente para crear el registro
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('files')
      .insert(fileReference)
      .select()
      .single();
      
    if (fileError) {
      console.error('Error guardando referencia de archivo:', fileError);
    }
    
    return {
      ...data,
      url: urlData?.signedUrl,
      fileData
    };
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    throw error;
  }
};

// Función para descargar un archivo
export const downloadFile = async (bucket: string, path: string) => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .download(path);
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw error;
  }
};

// Función para eliminar un archivo
export const deleteFile = async (bucket: string, path: string, fileId: string) => {
  try {
    // Eliminar el archivo de Storage
    const { error } = await supabaseAdmin
      .storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      throw error;
    }
    
    // Eliminar la referencia en la tabla files
    const { error: deleteError } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId);
      
    if (deleteError) {
      console.error('Error eliminando referencia de archivo:', deleteError);
    }
    
    return true;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    throw error;
  }
};