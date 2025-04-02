import React, { useEffect, useState } from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

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