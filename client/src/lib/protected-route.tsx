import { ReactNode } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useDevAuth } from './clerk-provider';

// Variable para determinar si estamos en modo desarrollo
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
                      import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                      '';

// Forzar a que siempre use Clerk, no importa el entorno
const isDevelopmentMode = false; // FORZANDO USO DE CLERK

// Hook combinado para autenticación - elige automáticamente entre Clerk y DevAuth
export function useAuth() {
  // Siempre usamos Clerk para forzar que aparezca el formulario
  return useClerkAuth();
}

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { isLoaded, userId, isSignedIn } = useAuth();
  
  // Calcular si está cargando basado en el entorno
  let isLoading = false;
  
  if (isDevelopmentMode) {
    // En modo desarrollo, solo verificamos auth del dev provider
    isLoading = !isLoaded;
  } else {
    // En modo producción, verificamos tanto Auth como User
    const { isLoaded: isUserLoaded } = useUser();
    isLoading = !isLoaded || !isUserLoaded;
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

        // Si no hay userId o no está signed in, redirigir a login usando redirección de navegador
        if (!userId && !isSignedIn) {
          window.location.href = "/auth/sign-in";
          return null; // Retornar null porque la redirección ya se ha iniciado
        }

        return <>{children}</>;
      }}
    </Route>
  );
}

export function PublicRoute({ path, children }: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth();
  
  // Calcular si está cargando basado en el entorno
  let isLoading = false;
  
  if (isDevelopmentMode) {
    // En modo desarrollo, solo verificamos auth del dev provider
    isLoading = !isLoaded;
  } else {
    // En modo producción, verificamos tanto Auth como User
    const { isLoaded: isUserLoaded } = useUser();
    isLoading = !isLoaded || !isUserLoaded;
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

        if (userId) {
          window.location.href = "/dashboard";
          return null; // Retornar null porque la redirección ya se ha iniciado
        }

        return <>{children}</>;
      }}
    </Route>
  );
}