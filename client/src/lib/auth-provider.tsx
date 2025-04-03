import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from './supabase';

// Definición del contexto de autenticación
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  updateProfile: (data: { [key: string]: any }) => Promise<boolean>;
}

// Creación del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Efecto para cargar sesión y usuario actual
  useEffect(() => {
    async function loadUserSession() {
      setIsLoading(true);
      
      // Obtener sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error cargando sesión:', sessionError);
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      
      if (session) {
        // Obtener datos del usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error cargando usuario:', userError);
        } else {
          setUser(user);
        }
      }
      
      setIsLoading(false);
    }
    
    // Cargar sesión y usuario al montar el componente
    loadUserSession();
    
    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );
    
    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Registrar un nuevo usuario
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Error al registrarse',
          description: error.message,
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Registro exitoso',
        description: 'Se ha enviado un correo de confirmación a tu dirección de email.',
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error en registro:', error);
      toast({
        title: 'Error al registrarse',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message,
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Sesión iniciada',
        description: '¡Bienvenido de vuelta!',
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      toast({
        title: 'Error al iniciar sesión',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente.',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: 'Error al cerrar sesión',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: 'Error al restablecer contraseña',
          description: error.message,
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Correo enviado',
        description: 'Se ha enviado un correo para restablecer tu contraseña.',
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toast({
        title: 'Error al restablecer contraseña',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  // Actualizar perfil de usuario
  const updateProfile = async (data: { [key: string]: any }) => {
    if (!user) {
      toast({
        title: 'Error al actualizar perfil',
        description: 'No hay usuario autenticado',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) {
        toast({
          title: 'Error al actualizar perfil',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado exitosamente.',
      });
      
      return true;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: 'Error al actualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Proporcionar el contexto
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}