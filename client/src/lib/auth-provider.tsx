import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Definir el tipo de usuario
type User = {
  id: string; // ID de Supabase es UUID (string)
  email: string;
  username: string;
  fullName: string;
  role: string;
  token?: string;
} | null;

// Definir el contexto de autenticación
type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Comprobar si hay una sesión guardada al iniciar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Primero verificamos si hay usuario en localStorage
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Verificamos con el servidor si la sesión sigue siendo válida
          try {
            const response = await fetch('/api/auth/user', {
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${parsedUser.token}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              // Actualizamos el usuario con datos frescos del servidor
              const updatedUser = { ...userData, token: parsedUser.token };
              setUser(updatedUser);
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            } else {
              // Si hay un error, limpiamos la sesión local
              setUser(null);
              localStorage.removeItem('auth_user');
              console.log('Sesión expirada o inválida');
            }
          } catch (serverError) {
            console.error('Error al verificar sesión con el servidor:', serverError);
          }
        }
      } catch (error) {
        console.error('Error al restaurar la sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Función de inicio de sesión
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', { 
        email, 
        password 
      });
      
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      toast({
        title: "Sesión iniciada",
        description: "Has iniciado sesión correctamente",
      });

      return true;
    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.message || "No se pudo iniciar sesión. Verifica tus credenciales.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const register = async (
    fullName: string,
    email: string,
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        fullName,
        email,
        username,
        password
      });
      
      const userData = await response.json();
      
      // Después del registro, iniciamos sesión automáticamente
      return await login(email, password);
      
    } catch (error: any) {
      console.error('Error de registro:', error);
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message || "No se pudo crear la cuenta. Inténtalo de nuevo.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}