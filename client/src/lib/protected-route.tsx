import { ReactNode } from 'react';
import { Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useDevAuth } from './dev-auth';
import { useAuthMode } from './clerk-provider';

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

// Hook combinado para autenticación - elige automáticamente entre Clerk y DevAuth
export function useAuth() {
  const { mode } = useAuthMode();
  
  if (mode === 'development') {
    return useDevAuth();
  } else {
    return useClerkAuth();
  }
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { mode } = useAuthMode();
  const auth = useAuth();
  let isLoading = false;
  let isAuthenticated = false;
  
  if (mode === 'development') {
    isLoading = !auth.isLoaded;
    isAuthenticated = !!auth.userId;
  } else {
    const { isLoaded: isUserLoaded } = useUser();
    isLoading = !auth.isLoaded || !isUserLoaded;
    isAuthenticated = !!auth.userId && auth.isSignedIn;
  }

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

        // Si no está autenticado, redirigir a login usando redirección de navegador
        if (!isAuthenticated) {
          window.location.href = "/auth/sign-in";
          return null; // Retornar null porque la redirección ya se ha iniciado
        }

        return <>{children}</>;
      }}
    </Route>
  );
}

export function PublicRoute({ path, children }: ProtectedRouteProps) {
  const { mode } = useAuthMode();
  const auth = useAuth();
  let isLoading = false;
  let isAuthenticated = false;
  
  if (mode === 'development') {
    isLoading = !auth.isLoaded;
    isAuthenticated = !!auth.userId;
  } else {
    const { isLoaded: isUserLoaded } = useUser();
    isLoading = !auth.isLoaded || !isUserLoaded;
    isAuthenticated = !!auth.userId;
  }

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

        if (isAuthenticated) {
          window.location.href = "/dashboard";
          return null; // Retornar null porque la redirección ya se ha iniciado
        }

        return <>{children}</>;
      }}
    </Route>
  );
}