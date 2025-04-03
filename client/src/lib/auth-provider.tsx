import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  supabase, 
  signUp as supabaseSignUp, 
  signIn as supabaseSignIn, 
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession
} from './supabase';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Tipo para las respuestas de autenticación
type AuthResponse = {
  user?: User | null;
  session?: Session | null;
  error?: Error | null;
};

// Definir el tipo de contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

// Crear el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Inicializar el estado de autenticación al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sesión actual
        const { data: { session } } = await getSession();
        setSession(session);

        // Verificar usuario actual
        if (session) {
          const { data: { user } } = await getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        setError(error instanceof Error ? error : new Error('Error de autenticación desconocido'));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Suscribirse a cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          const { data: { user } } = await getCurrentUser();
          setUser(user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función para registrar un usuario
  const signUp = async (email: string, password: string, metadata?: any): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { data, error } = await supabaseSignUp(email, password, metadata);
      
      if (error) {
        setError(error);
        toast({
          title: 'Error de registro',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Registro exitoso',
        description: 'Se ha enviado un correo de verificación a tu dirección de email.',
      });
      
      return { 
        user: data.user,
        session: data.session
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error de registro desconocido');
      setError(error);
      toast({
        title: 'Error de registro',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { data, error } = await supabaseSignIn(email, password);
      
      if (error) {
        setError(error);
        toast({
          title: 'Error de inicio de sesión',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido de nuevo, ${data.user?.email}`,
      });
      
      return { 
        user: data.user,
        session: data.session
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error de inicio de sesión desconocido');
      setError(error);
      toast({
        title: 'Error de inicio de sesión',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      await supabaseSignOut();
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cerrar sesión');
      setError(error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión correctamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}