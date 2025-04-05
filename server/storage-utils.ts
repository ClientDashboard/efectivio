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
  
  // Verificar que la conexión a Supabase está configurada correctamente
  console.log(`SUPABASE_URL configurada: ${!!process.env.SUPABASE_URL}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY configurada: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  
  // Si faltan las variables de entorno, devolvemos false para todos los buckets
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Error: Variables de entorno de Supabase no configuradas correctamente");
    return CLIENT_STORAGE_BUCKETS.reduce((acc, bucket) => {
      acc[bucket] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }
  
  const results: Record<string, boolean> = {};
  
  // Para cada bucket, creamos la carpeta del cliente
  for (const bucketName of CLIENT_STORAGE_BUCKETS) {
    try {
      console.log(`Procesando bucket: ${bucketName}`);
      
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
      
      console.log(`Verificando si ya existe la carpeta para cliente ${clientId} en bucket ${bucketName}`);
      
      try {
        // Verificar si la carpeta ya existe para este cliente
        const { data: existingFiles, error: listError } = await supabaseAdmin
          .storage
          .from(bucketName)
          .list(clientId.toString());
          
        if (listError) {
          console.error(`Error al listar archivos en bucket ${bucketName}:`, listError);
        }
        
        if (existingFiles && existingFiles.length > 0) {
          console.log(`ℹ️ La carpeta para el cliente ${clientId} ya existe en el bucket ${bucketName}.`);
          results[bucketName] = true;
          continue;
        }
      } catch (listError) {
        console.error(`Error al listar archivos en bucket ${bucketName}:`, listError);
        // Continuamos intentando crear la carpeta
      }
      
      console.log(`Creando carpeta principal para cliente ${clientId} en bucket ${bucketName}`);
      
      try {
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from(bucketName)
          .upload(clientFolderPath, placeholderFile, {
            contentType: 'text/plain',
            upsert: true // Cambiado a true para asegurar que se cree incluso si ya existe
          });
        
        if (uploadError) {
          console.error(`Error al crear carpeta en bucket ${bucketName} para cliente ${clientId}:`, uploadError);
          results[bucketName] = false;
        } else {
          console.log(`✅ Carpeta creada en bucket ${bucketName} para cliente ${clientId}`, uploadData);
          results[bucketName] = true;
          
          // Configurar políticas de acceso específicas para este cliente
          // Esto permitirá que solo este cliente acceda a sus archivos
          await configureClientStorageAccess(bucketName, clientId);
          
          // Crear subcarpetas comunes para mejor organización
          console.log(`Creando subcarpetas para cliente ${clientId} en bucket ${bucketName}`);
          const subfolders = ['facturas', 'recibos', 'contratos', 'documentos', 'otros'];
          for (const subfolder of subfolders) {
            try {
              const subfolderPath = `${clientId}/${subfolder}/.keep`;
              const { error: subfolderError } = await supabaseAdmin
                .storage
                .from(bucketName)
                .upload(subfolderPath, placeholderFile, {
                  contentType: 'text/plain',
                  upsert: true
                });
                
              if (subfolderError) {
                console.warn(`⚠️ Error al crear subcarpeta ${subfolder} para cliente ${clientId}:`, subfolderError);
              } else {
                console.log(`✅ Subcarpeta ${subfolder} creada para cliente ${clientId}`);
              }
            } catch (subfolderError) {
              console.error(`Error al crear subcarpeta ${subfolder} para cliente ${clientId}:`, subfolderError);
            }
          }
        }
      } catch (uploadError) {
        console.error(`Error al subir archivo a bucket ${bucketName}:`, uploadError);
        results[bucketName] = false;
      }
    } catch (error) {
      console.error(`Error general al crear carpeta en bucket ${bucketName}:`, error);
      results[bucketName] = false;
    }
  }
  
  console.log(`Resultado final de creación de estructura para cliente ${clientId}:`, results);
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