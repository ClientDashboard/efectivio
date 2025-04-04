import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useUserStore } from './store';

export interface AuthUser {
  id: number;
  clerkId: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  initials: string;
  name?: string; // Para compatibilidad con el sidebar
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: any;
  signUp: any;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthContextType {
  const clerkAuth = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { user, setUser, clearUser } = useUserStore();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  // Sincronizar usuario de Clerk con nuestro store
  useEffect(() => {
    if (isUserLoaded && clerkUser) {
      // Iniciales para avatar
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const initials = firstName && lastName
        ? `${firstName[0]}${lastName[0]}`
        : clerkUser.username?.[0] || clerkUser.emailAddresses?.[0]?.emailAddress?.[0] || 'U';

      // Formatear usuario para el store
      const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');
      const authUser: AuthUser = {
        id: 0, // Se actualizará cuando obtengamos los datos de nuestra BD
        clerkId: clerkUser.id,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split('@')[0] || 'usuario',
        email: clerkUser.emailAddresses[0].emailAddress || 'email@ejemplo.com',
        fullName: fullName,
        name: fullName, // Para compatibilidad con el sidebar
        role: 'admin', // Por defecto, se actualizará con datos de nuestra BD
        initials: initials.toUpperCase(),
      };

      // Actualizar store
      setUser(authUser);

      // Aquí podríamos hacer una llamada a nuestra API para obtener datos adicionales
      // Como el rol específico o el ID en nuestra base de datos
      fetchUserData(clerkUser.id);
    } else if (isUserLoaded && !clerkUser) {
      clearUser();
    }
  }, [isUserLoaded, clerkUser, setUser, clearUser]);

  // Obtener datos adicionales del usuario de nuestra API
  const fetchUserData = async (clerkId: string) => {
    try {
      const response = await fetch(`/api/users/clerk/${clerkId}`);
      if (response.ok) {
        const userData = await response.json();
        
        if (user) {
          // Actualizar user store con datos adicionales como el rol y el ID en nuestra BD
          const updatedUser: AuthUser = {
            ...user,
            id: userData.id || 0,
            username: user.username,
            email: user.email,
            role: userData.role || 'user',
          };
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
    }
  };

  return {
    user,
    isLoaded: isUserLoaded && clerkAuth.isLoaded,
    isSignedIn: !!clerkUser,
    signIn,
    signUp,
    signOut: async () => {
      if (clerkAuth.signOut) {
        await clerkAuth.signOut();
      }
      clearUser();
    },
  };
}