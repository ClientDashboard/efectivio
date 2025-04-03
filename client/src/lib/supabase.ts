import { createClient } from '@supabase/supabase-js';

// Utilizamos las variables de entorno VITE que fueron sincronizadas automáticamente
// desde las variables de backend por el script env-sync.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciales de Supabase no encontradas. Algunas funciones no estarán disponibles.');
}

// Crear el cliente de Supabase para el frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Constantes para buckets de almacenamiento (deben coincidir con los del backend)
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  INVOICES: 'invoices',
  RECEIPTS: 'receipts',
  CONTRACTS: 'contracts',
  PROFILES: 'profiles',
  BACKUPS: 'backups',
};

// Función para subir un archivo
export const uploadFile = async (
  bucket: string,
  file: File,
  path = '',
  metadata?: Record<string, any>
) => {
  try {
    const filePath = `${path ? path + '/' : ''}${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        ...(metadata ? { metadata } : {})
      });
      
    if (error) throw error;
    
    // Obtener URL de descarga temporal
    const { data: urlData } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60); // URL válida por 1 hora
      
    return {
      ...data,
      url: urlData?.signedUrl,
    };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};

// Función para obtener lista de archivos
export const listFiles = async (bucket: string, path = '') => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list(path);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al listar archivos:', error);
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
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw error;
  }
};

// Función para eliminar un archivo
export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
};

// Auth helpers
export const signUp = async (email: string, password: string, metadata?: any) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email);
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};