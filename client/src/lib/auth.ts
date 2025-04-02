import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // For now, we'll use a mock user
        // In a real implementation, this would check with Clerk
        const mockUser = localStorage.getItem('efectivio_user');
        
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Mock login - in real app, use Clerk
      const mockUser: User = {
        id: '1',
        name: 'Juan Sánchez',
        email: email,
        role: 'Administrador',
        initials: 'JS'
      };
      
      localStorage.setItem('efectivio_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLocation('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // Mock registration - in real app, use Clerk
      const nameParts = name.split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}` 
        : `${nameParts[0][0]}${nameParts[0][1] || ''}`;
      
      const mockUser: User = {
        id: '1',
        name: name,
        email: email,
        role: 'Administrador',
        initials: initials.toUpperCase()
      };
      
      localStorage.setItem('efectivio_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLocation('/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('efectivio_user');
    setUser(null);
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
