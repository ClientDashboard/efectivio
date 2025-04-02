import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

// Obtener la clave pública de Clerk desde las variables de entorno
// Al utilizar Vite, necesitamos el prefijo VITE_
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

if (!publishableKey) {
  console.error('Falta la clave pública de Clerk. La autenticación no funcionará correctamente.');
}

type ClerkProviderProps = {
  children: React.ReactNode;
};

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider
      publishableKey={publishableKey}
      appearance={{
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
      {children}
    </BaseClerkProvider>
  );
}