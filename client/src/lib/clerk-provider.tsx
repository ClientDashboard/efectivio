import React, { useEffect, useState } from 'react';
import { ClerkProvider as BaseClerkProvider, useAuth } from '@clerk/clerk-react';
import { supabase } from './supabase';

// Obtener la clave pública de Clerk desde las variables de entorno
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('ERROR: Falta VITE_CLERK_PUBLISHABLE_KEY en las variables de entorno');
}

// Validar que la clave sea válida
if (!publishableKey.startsWith('pk_') && !publishableKey.startsWith('pk_test_')) {
  throw new Error('ERROR: VITE_CLERK_PUBLISHABLE_KEY inválida');
}

type ClerkProviderProps = {
  children: React.ReactNode;
};

// Componente de sincronización de sesión con Supabase
function SupabaseSessionSyncProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId, sessionId } = useAuth();

  // Sincroniza el token JWT de Clerk con Supabase
  useEffect(() => {
    // Si no hay usuario, hacer logout en Supabase
    if (!userId) {
      supabase.auth.signOut();
      return;
    }

    // Función para sincronizar la sesión
    const syncSupabaseSession = async () => {
      try {
        // Obtener el token JWT personalizado para Supabase
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.error('No se pudo obtener el token JWT para Supabase');
          return;
        }
        
        // Establecer la sesión en Supabase usando el token JWT
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });
        
        if (error) {
          console.error('Error al sincronizar la sesión con Supabase:', error);
        } else {
          console.log('Sesión sincronizada con Supabase correctamente');
        }
      } catch (error) {
        console.error('Error al sincronizar la sesión:', error);
      }
    };
    
    // Sincronizar la sesión cuando cambia el usuario o la sesión
    syncSupabaseSession();
  }, [userId, sessionId, getToken]);
  
  return <>{children}</>;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Asegurarnos de que el componente solo se renderice en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitamos un error de hidratación renderizando solo del lado del cliente
  if (!mounted) {
    return null;
  }

  return (
    <BaseClerkProvider
      publishableKey={publishableKey}
      appearance={{
      onError={(error) => {
        console.error('Error en Clerk:', error);
      }}
        variables: {
          colorPrimary: '#39FFBD',
          colorBackground: '#062644',
        },
        elements: {
          formButtonPrimary:
            'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-background border border-border shadow-sm',
          formFieldInput: 'bg-background border border-input',
        },
      }}
    >
      <SupabaseSessionSyncProvider>
        {children}
      </SupabaseSessionSyncProvider>
    </BaseClerkProvider>
  );
}