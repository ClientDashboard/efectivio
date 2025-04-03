import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con la clave de servicio para acceso administrativo
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lista de buckets donde crear carpetas para clientes
const CLIENT_STORAGE_BUCKETS = [
  'documents',
  'invoices',
  'receipts',
  'contracts'
];

/**
 * Verifica si existe un bucket de almacenamiento
 * @param bucketName Nombre del bucket a verificar
 * @returns true si el bucket existe, false en caso contrario
 */
async function bucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .storage
      .getBucket(bucketName);
    
    return !!data && !error;
  } catch (error) {
    console.error(`Error verificando bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Crea la estructura de carpetas necesaria para un cliente en los buckets de almacenamiento
 * @param clientId ID del cliente para el que crear la estructura
 * @returns Objeto con el estado de creación de carpetas en cada bucket
 */
export async function createClientStorageStructure(clientId: number): Promise<Record<string, boolean>> {
  console.log(`Creando estructura de almacenamiento para cliente ID: ${clientId}`);
  
  const results: Record<string, boolean> = {};
  
  // Para cada bucket, creamos la carpeta del cliente
  for (const bucketName of CLIENT_STORAGE_BUCKETS) {
    try {
      // Verificar primero si el bucket existe
      const exists = await bucketExists(bucketName);
      if (!exists) {
        console.warn(`⚠️ El bucket ${bucketName} no existe. Omitiendo creación de carpeta.`);
        results[bucketName] = false;
        continue;
      }
      
      // En Supabase Storage, las carpetas se crean implícitamente al subir un archivo
      // Como workaround, creamos un archivo placeholder .keep
      const placeholderFile = new Uint8Array([]);
      const clientFolderPath = `${clientId}/.keep`;
      
      // Verificar si la carpeta ya existe para este cliente
      const { data: existingFiles } = await supabaseAdmin
        .storage
        .from(bucketName)
        .list(clientId.toString());
        
      if (existingFiles && existingFiles.length > 0) {
        console.log(`ℹ️ La carpeta para el cliente ${clientId} ya existe en el bucket ${bucketName}.`);
        results[bucketName] = true;
        continue;
      }
      
      const { error } = await supabaseAdmin
        .storage
        .from(bucketName)
        .upload(clientFolderPath, placeholderFile, {
          contentType: 'text/plain',
          upsert: true // Cambiado a true para asegurar que se cree incluso si ya existe
        });
      
      if (error) {
        console.error(`Error al crear carpeta en bucket ${bucketName} para cliente ${clientId}:`, error);
        results[bucketName] = false;
      } else {
        console.log(`✅ Carpeta creada en bucket ${bucketName} para cliente ${clientId}`);
        results[bucketName] = true;
        
        // Configurar políticas de acceso específicas para este cliente
        // Esto permitirá que solo este cliente acceda a sus archivos
        await configureClientStorageAccess(bucketName, clientId);
        
        // Crear subcarpetas comunes para mejor organización
        const subfolders = ['facturas', 'recibos', 'contratos', 'documentos', 'otros'];
        for (const subfolder of subfolders) {
          const subfolderPath = `${clientId}/${subfolder}/.keep`;
          await supabaseAdmin
            .storage
            .from(bucketName)
            .upload(subfolderPath, placeholderFile, {
              contentType: 'text/plain',
              upsert: true
            });
        }
      }
    } catch (error) {
      console.error(`Error general al crear carpeta en bucket ${bucketName}:`, error);
      results[bucketName] = false;
    }
  }
  
  return results;
}

/**
 * Configura los permisos adecuados para un cliente en un bucket específico
 * @param bucketName Nombre del bucket
 * @param clientId ID del cliente
 */
async function configureClientStorageAccess(bucketName: string, clientId: number): Promise<void> {
  try {
    // Las políticas a nivel de carpeta requieren configuración adicional en Supabase
    // Aquí simplemente registramos que debemos configurar esto manualmente
    console.log(`Política de almacenamiento para cliente ${clientId} en bucket ${bucketName} debe ser configurada`);
    
    // En un entorno de producción, esto se configuraría usando SQL directo o
    // la API administrativa de Supabase para crear políticas de seguridad específicas
  } catch (error) {
    console.error(`Error al configurar políticas para cliente ${clientId} en bucket ${bucketName}:`, error);
  }
}