import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase para el navegador
// Usa las variables de entorno VITE_ que están expuestas al cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Obtiene el token JWT de la sesión actual
 * @returns El token JWT o null si no hay sesión
 */
export async function getSessionToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Sube un archivo al storage de Supabase
 * @param bucketName Nombre del bucket
 * @param filePath Ruta del archivo en el bucket
 * @param file Archivo a subir (File del navegador)
 * @returns URL pública del archivo o undefined si hay error
 */
export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: File
): Promise<string | undefined> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: true
    });
    
  if (error) {
    console.error(`Error al subir archivo a ${bucketName}/${filePath}:`, error);
    return undefined;
  }
  
  // Obtener URL pública si el bucket es público, o URL firmada si es privado
  let url: string;
  if (bucketName === 'profiles') {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    url = data.publicUrl;
  } else {
    // URL firmada con expiración de 60 minutos para buckets privados
    const { data } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 60 * 60);
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
  const { error } = await supabase.storage
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
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn);
    
  if (error) {
    console.error(`Error al generar URL firmada para ${bucketName}/${filePath}:`, error);
    return undefined;
  }
  
  return data.signedUrl;
}

/**
 * Obtiene una lista de archivos en un bucket para un usuario
 * @param bucketName Nombre del bucket
 * @param path Ruta dentro del bucket
 * @returns Lista de archivos o undefined si hay error
 */
export async function listFiles(
  bucketName: string,
  path: string = ''
): Promise<any[] | undefined> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path);
    
  if (error) {
    console.error(`Error al listar archivos en ${bucketName}/${path}:`, error);
    return undefined;
  }
  
  return data;
}

/**
 * Actualiza los datos del perfil de usuario
 * @param profileData Datos del perfil a actualizar
 * @returns true si se actualizó correctamente, false si hubo error
 */
export async function updateProfile(profileData: { [key: string]: any }): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);
    
  if (error) {
    console.error('Error al actualizar perfil:', error);
    return false;
  }
  
  return true;
}

/**
 * Obtiene los datos del perfil del usuario actual
 * @returns Datos del perfil o undefined si hay error
 */
export async function getProfile(): Promise<any | undefined> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No hay usuario autenticado');
    return undefined;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error al obtener perfil:', error);
    return undefined;
  }
  
  return data;
}