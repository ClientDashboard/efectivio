import React, { createContext, useContext } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useDevAuth } from './dev-auth';

// Variable para determinar si estamos en modo desarrollo
const isDevelopmentMode = !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Interfaz unificada para la autenticación
export interface AuthContextType {
  userId: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => Promise<void>;
  getToken: (options?: { template?: string }) => Promise<string | null>;
}

// Contexto de autenticación unificado
const AuthContext = createContext<AuthContextType | null>(null);

// Proveedor de autenticación unificado
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Si estamos en modo desarrollo, usar el proveedor de desarrollo
  // De lo contrario, usar Clerk

  let authValue: AuthContextType;

  if (isDevelopmentMode) {
    const devAuth = useDevAuth();
    authValue = {
      userId: devAuth.userId,
      isSignedIn: devAuth.isSignedIn,
      isLoaded: devAuth.isLoaded,
      signOut: devAuth.signOut,
      getToken: devAuth.getToken,
    };
  } else {
    const clerkAuth = useClerkAuth();
    // Asegurarnos que userId sea string | null, nunca undefined
    const userId: string | null = typeof clerkAuth.userId === 'string' ? clerkAuth.userId : null;
    
    authValue = {
      userId,
      isSignedIn: !!clerkAuth.isSignedIn,
      isLoaded: clerkAuth.isLoaded,
      signOut: clerkAuth.signOut,
      getToken: clerkAuth.getToken,
    };
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar la autenticación unificada
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}