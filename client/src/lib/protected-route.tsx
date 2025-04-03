import { ReactNode } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from './auth-provider';

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

/**
 * Componente de ruta protegida que verifica la autenticación
 * 
 * Si el usuario no está autenticado, redirige a la página de login
 * Si se está cargando, muestra un spinner
 * Si está autenticado, renderiza los hijos
 */
export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth/sign-in" />;
        }

        return <>{children}</>;
      }}
    </Route>
  );
}

/**
 * Componente de ruta pública que redirige a usuarios autenticados
 * 
 * Si el usuario está autenticado, redirige al dashboard
 * Si se está cargando, muestra un spinner
 * Si no está autenticado, renderiza los hijos
 */
export function PublicRoute({ path, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (user) {
          return <Redirect to="/dashboard" />;
        }

        return <>{children}</>;
      }}
    </Route>
  );
}