import { ReactNode } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useDevAuth } from './clerk-provider';

// Variable para determinar si estamos en modo desarrollo
const isDevelopmentMode = typeof window !== 'undefined' && 
                        (typeof (window as any).ENV?.VITE_CLERK_PUBLISHABLE_KEY === 'undefined' || 
                        !(window as any).ENV?.VITE_CLERK_PUBLISHABLE_KEY ||
                        window.location.hostname !== 'efectivio.com');

// En desarrollo, siempre usamos el DevAuth para evitar problemas con Clerk
export function useAuth() {
  // En este momento siempre usamos el proveedor de desarrollo para evitar
  // el error de requerir ClerkProvider
  const devAuth = useDevAuth();
  return {
    ...devAuth,
    // Garantizar que signUp y signIn están disponibles
    signUp: devAuth.signUp,
    signIn: devAuth.signIn
  };
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

        // Si no hay userId o no está signed in, redirigir a login
        if (!userId && !isSignedIn) {
          return <Redirect to="/auth/sign-in" />;
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
          return <Redirect to="/" />;
        }

        return <>{children}</>;
      }}
    </Route>
  );
}