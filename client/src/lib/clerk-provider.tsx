import React, { useEffect, useState, createContext, useContext } from 'react';
import { ClerkProvider as BaseClerkProvider, useAuth } from '@clerk/clerk-react';
import { supabase } from './supabase';
import { DevAuthProvider as EnhancedDevAuthProvider, useDevAuth as useEnhancedDevAuth } from './dev-auth';

// Usar una clave de desarrollo si no hay variable de entorno
// Considerar tanto VITE_ como NEXT_PUBLIC_ prefijos
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
                       import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                       '';

// Para fines de depuración - remover en producción
console.log('CLERK KEY disponible:', !!publishableKey);

// Variable para indicar si estamos en modo desarrollo sin Clerk o si la clave es de producción y no estamos en efectivio.com
const isDevelopmentMode = !publishableKey || 
                         (publishableKey.startsWith('pk_live_') && 
                          window.location.hostname !== 'efectivio.com');

// Interfaz para el contexto de autenticación en desarrollo
interface DevAuthContextType {
  userId: string | null;
  sessionId: string | null;
  getToken: (options?: { template?: string }) => Promise<string | null>;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => Promise<void>;
}

// Contexto de autenticación para desarrollo
const DevAuthContext = createContext<DevAuthContextType>({
  userId: 'dev-user-123',
  sessionId: 'dev-session-123',
  getToken: async () => 'mock-token-for-development',
  isSignedIn: true,
  isLoaded: true,
  signOut: async () => {},
});

// Hook para usar en modo desarrollo
export function useDevAuth() {
  return useContext(DevAuthContext);
}

// Proveedor para modo desarrollo (este es un wrapper alrededor del mejorado)
function DevAuthProvider({ children }: { children: React.ReactNode }) {
  return <EnhancedDevAuthProvider>{children}</EnhancedDevAuthProvider>;
}

// Componente de sincronización de sesión con Supabase
function SupabaseSessionSyncProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId, sessionId } = useAuth();

  useEffect(() => {
    if (!userId) {
      supabase.auth.signOut();
      return;
    }

    const syncSupabaseSession = async () => {
      try {
        const token = await getToken({ template: 'supabase' });

        if (!token) {
          console.warn('No se pudo obtener el token JWT para Supabase');
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        if (error) {
          console.warn('Error al sincronizar la sesión con Supabase:', error);
        }
      } catch (error) {
        console.warn('Error al sincronizar la sesión:', error);
      }
    };

    syncSupabaseSession();
  }, [userId, sessionId, getToken]);

  return <>{children}</>;
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Si estamos en modo desarrollo y no hay clave de Clerk, usar el proveedor de desarrollo
  if (isDevelopmentMode) {
    console.log('Usando proveedor de autenticación para desarrollo');
    return <DevAuthProvider>{children}</DevAuthProvider>;
  }

  // Si tenemos una clave de Clerk, usar el proveedor normal
  console.log('Usando proveedor de autenticación Clerk');
  return (
    <BaseClerkProvider
      publishableKey={publishableKey}
      appearance={{
        variables: {
          colorPrimary: '#39FFBD',
          colorBackground: '#062644',
        },
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
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