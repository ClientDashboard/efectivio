import { ReactNode } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

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
          return <Redirect to="/" />;
        }

        return <>{children}</>;
      }}
    </Route>
  );
}