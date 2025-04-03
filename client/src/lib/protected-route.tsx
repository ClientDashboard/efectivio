import { ReactNode } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

/**
 * Componente de ruta protegida que verifica la autenticación con Clerk
 * 
 * Si el usuario no está autenticado, redirige a la página de login
 * Si se está cargando, muestra un spinner
 * Si está autenticado, renderiza los hijos
 */
export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();

  const isLoading = !isLoaded || !isUserLoaded;

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

        if (!userId) {
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
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();

  const isLoading = !isLoaded || !isUserLoaded;

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

        if (userId) {
          return <Redirect to="/dashboard" />;
        }

        return <>{children}</>;
      }}
    </Route>
  );
}