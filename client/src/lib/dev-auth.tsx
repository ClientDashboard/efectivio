import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interfaz para el contexto de autenticación en desarrollo
export interface DevAuthContextType {
  userId: string | null;
  sessionId: string | null;
  getToken: (options?: { template?: string }) => Promise<string | null>;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => Promise<void>;
  
  // Agregar funciones para sign-up y sign-in
  signUp: {
    isLoaded: boolean;
    setActive: (params: { session: string }) => Promise<any>;
    create: (params: any) => Promise<any>;
    prepareEmailAddressVerification: (params: any) => Promise<any>;
    attemptEmailAddressVerification: (params: any) => Promise<any>;
  };
  signIn: {
    isLoaded: boolean;
    setActive: (params: { session: string }) => Promise<any>;
    create: (params: any) => Promise<any>;
  };
  user: {
    isLoaded: boolean;
    id: string | null;
    emailAddresses: Array<{emailAddress: string}>;
    firstName: string;
    lastName: string;
  };
}

// Contexto de autenticación para desarrollo
const DevAuthContext = createContext<DevAuthContextType>({
  userId: 'dev-user-123',
  sessionId: 'dev-session-123',
  getToken: async () => 'mock-token-for-development',
  isSignedIn: true,
  isLoaded: true,
  signOut: async () => {},
  signUp: {
    isLoaded: true,
    setActive: async () => ({}),
    create: async () => ({}),
    prepareEmailAddressVerification: async () => ({}),
    attemptEmailAddressVerification: async () => ({ status: 'complete' }),
  },
  signIn: {
    isLoaded: true,
    setActive: async () => ({}),
    create: async () => ({}),
  },
  user: {
    isLoaded: true,
    id: 'dev-user-123',
    emailAddresses: [{ emailAddress: 'dev@example.com' }],
    firstName: 'Dev',
    lastName: 'User',
  }
});

// Proveedor para modo desarrollo
export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    localStorage.getItem('dev-auth-user') !== null
  );
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('dev-auth-user') || null
  );
  
  useEffect(() => {
    // Si hay un usuario almacenado, recuperarlo
    const storedUser = localStorage.getItem('dev-auth-user');
    if (storedUser) {
      setUserId(storedUser);
      setIsSignedIn(true);
    } else {
      setUserId(null);
      setIsSignedIn(false);
    }
  }, []);

  // Implementación simulada para desarrollo
  const mockAuthValue: DevAuthContextType = {
    userId,
    sessionId: 'dev-session-123',
    getToken: async (options?: { template?: string }) => 'mock-token-for-development',
    isSignedIn,
    isLoaded: true,
    signOut: async () => {
      console.log('Simulando cierre de sesión en modo desarrollo');
      
      // Limpiar sesión del localStorage
      localStorage.removeItem('dev-auth-user');
      localStorage.removeItem('dev-auth-email');
      localStorage.removeItem('dev-auth-name');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('clerk-db');
      
      // Actualizar estado
      setUserId(null);
      setIsSignedIn(false);
      
      // Redirigir a la página principal
      if (window.location.hostname === 'efectivio.com') {
        window.location.href = 'https://efectivio.com';
      } else {
        // En desarrollo, solo redirigimos a la raíz
        window.location.href = '/';
      }
    },
    // Implementar funciones de registro
    signUp: {
      isLoaded: true,
      setActive: async ({ session }) => {
        return { status: 'complete' };
      },
      create: async (params) => {
        const { emailAddress, password, firstName, lastName } = params;
        
        // Simular registro guardando en localStorage
        localStorage.setItem('dev-auth-user', `dev-${Date.now()}`);
        localStorage.setItem('dev-auth-email', emailAddress);
        localStorage.setItem('dev-auth-name', `${firstName} ${lastName || ''}`);
        
        toast({
          title: "Registro simulado",
          description: "En modo desarrollo, el registro es inmediato",
        });
        
        return { status: 'complete' };
      },
      prepareEmailAddressVerification: async () => {
        return { status: 'complete' };
      },
      attemptEmailAddressVerification: async () => {
        // Actualizar estado después de verificación
        const userId = localStorage.getItem('dev-auth-user');
        setUserId(userId);
        setIsSignedIn(true);
        
        return { status: 'complete' };
      }
    },
    // Implementar funciones de inicio de sesión
    signIn: {
      isLoaded: true,
      setActive: async ({ session }) => {
        return { status: 'complete' };
      },
      create: async ({ identifier, password }) => {
        // Simular inicio de sesión
        const userId = `dev-${Date.now()}`;
        localStorage.setItem('dev-auth-user', userId);
        localStorage.setItem('dev-auth-email', identifier);
        
        // Actualizar estado
        setUserId(userId);
        setIsSignedIn(true);
        
        toast({
          title: "Sesión iniciada",
          description: "En modo desarrollo, el inicio de sesión es inmediato",
        });
        
        return { status: 'complete' };
      }
    },
    // Datos de usuario para desarrollo
    user: {
      isLoaded: true,
      id: userId,
      emailAddresses: [{ 
        emailAddress: localStorage.getItem('dev-auth-email') || 'dev@example.com'
      }],
      firstName: (localStorage.getItem('dev-auth-name') || 'Dev User').split(' ')[0],
      lastName: (localStorage.getItem('dev-auth-name') || 'Dev User').split(' ').slice(1).join(' '),
    }
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