import React, { useEffect, useState } from 'react';
import { ClerkProvider as BaseClerkProvider, useAuth } from '@clerk/clerk-react';
import { supabase } from './supabase';

// Usar una clave de desarrollo si no hay variable de entorno
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_Y29vbC1saWdlci05Mi5jbGVyay5hY2NvdW50cy5kZXYk';

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