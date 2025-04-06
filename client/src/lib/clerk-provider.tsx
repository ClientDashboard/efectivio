import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider as BaseClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from './supabase';
import { DevAuthProvider, useDevAuth } from './dev-auth';

// Usar una clave de desarrollo si no hay variable de entorno
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
                        import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                        '';

// Para fines de depuración - remover en producción
console.log('CLERK KEY disponible:', !!publishableKey);

// Variable para indicar si estamos en modo desarrollo o en producción
const isDevelopmentMode = true; // USAR MODO DESARROLLO PARA PRUEBAS LOCALES

// Contexto para exponer información sobre el modo de autenticación actual
interface AuthModeContextType {
  mode: 'development' | 'production';
}

const AuthModeContext = createContext<AuthModeContextType>({
  mode: 'development',
});

export const useAuthMode = () => useContext(AuthModeContext);

// Componente de sincronización para modo Clerk
function ClerkSupabaseSync({ children }: { children: React.ReactNode }) {
  const auth = useClerkAuth();
  
  useEffect(() => {
    if (!auth.userId) {
      supabase.auth.signOut();
      return;
    }

    const syncSupabaseSession = async () => {
      try {
        const token = await auth.getToken({ template: 'supabase' });
        
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
        console.warn('Error al sincronizar la sesión con Supabase:', error);
      }
    };

    syncSupabaseSession();
  }, [auth.userId, auth.sessionId, auth.getToken]);

  return <>{children}</>;
}

// Componente de sincronización para modo desarrollo
function DevSupabaseSync({ children }: { children: React.ReactNode }) {
  const devAuth = useDevAuth();
  
  useEffect(() => {
    if (!devAuth.userId) {
      supabase.auth.signOut();
      return;
    }

    const syncSessionForDev = async () => {
      try {
        // En desarrollo usamos un token simulado
        console.log('Modo desarrollo: Simulando sincronización con Supabase');
        
        // No hacemos nada realmente con Supabase en modo desarrollo
      } catch (error) {
        console.warn('Error simulando sesión de Supabase:', error);
      }
    };

    syncSessionForDev();
  }, [devAuth.userId, devAuth.sessionId]);

  return <>{children}</>;
}

// Proveedor principal de autenticación
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // En modo desarrollo, usamos el proveedor de desarrollo
  if (isDevelopmentMode) {
    console.log('Usando proveedor de autenticación para desarrollo');
    return (
      <AuthModeContext.Provider value={{ mode: 'development' }}>
        <DevAuthProvider>
          <DevSupabaseSync>
            {children}
          </DevSupabaseSync>
        </DevAuthProvider>
      </AuthModeContext.Provider>
    );
  }

  // En modo producción, usamos Clerk
  console.log('Usando proveedor de autenticación Clerk');
  return (
    <AuthModeContext.Provider value={{ mode: 'production' }}>
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
        localization={{
          socialButtonsBlockButton: "Continuar con {{provider}}"
        }}
      >
        <ClerkSupabaseSync>
          {children}
        </ClerkSupabaseSync>
      </BaseClerkProvider>
    </AuthModeContext.Provider>
  );
}