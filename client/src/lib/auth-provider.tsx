import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Definir el tipo de usuario
type User = {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
} | null;

// Definir el contexto de autenticación
type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
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
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
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
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // En producción, esto se reemplazaría con una llamada real a una API
      // Por ahora, simulamos una respuesta exitosa para desarrollo
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = {
        id: 1,
        email: `${username}@ejemplo.com`,
        username,
        fullName: username,
        role: 'admin'
      };

      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      toast({
        title: "Sesión iniciada",
        description: "Has iniciado sesión correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "No se pudo iniciar sesión. Verifica tus credenciales.",
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
      // En producción, esto se reemplazaría con una llamada real a una API
      // Por ahora, simulamos una respuesta exitosa para desarrollo
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser = {
        id: 1,
        email,
        username,
        fullName,
        role: 'user'
      };

      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      toast({
        title: "Cuenta creada",
        description: "Tu cuenta ha sido creada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error de registro:', error);
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
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