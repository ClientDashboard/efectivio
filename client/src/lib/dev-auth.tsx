import React, { createContext, useContext } from 'react';

// Interfaz para el contexto de autenticación en desarrollo
export interface DevAuthContextType {
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

// Proveedor para modo desarrollo
export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  // Implementación simulada para desarrollo
  const mockAuthValue: DevAuthContextType = {
    userId: 'dev-user-123',
    sessionId: 'dev-session-123',
    getToken: async (options?: { template?: string }) => 'mock-token-for-development',
    isSignedIn: true,
    isLoaded: true,
    signOut: async () => {
      console.log('Simulando cierre de sesión en modo desarrollo');
    },
  };

  return (
    <DevAuthContext.Provider value={mockAuthValue}>
      {children}
    </DevAuthContext.Provider>
  );
}

// Hook para usar en modo desarrollo
export function useDevAuth() {
  return useContext(DevAuthContext);
}