import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from './auth-provider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege rutas para que solo sean accesibles por usuarios autenticados
 * Si el usuario no está autenticado, se redirige a la ruta especificada (por defecto '/auth')
 */
export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Redirigir si no hay usuario autenticado
  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  // Renderizar children si el usuario está autenticado
  return <>{children}</>;
};

/**
 * Componente que protege rutas para que solo sean accesibles por usuarios NO autenticados
 * Si el usuario está autenticado, se redirige a la ruta especificada (por defecto '/')
 */
export const PublicOnlyRoute = ({ 
  children, 
  redirectTo = '/' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Redirigir si hay un usuario autenticado
  if (user) {
    return <Redirect to={redirectTo} />;
  }

  // Renderizar children si el usuario NO está autenticado
  return <>{children}</>;
};