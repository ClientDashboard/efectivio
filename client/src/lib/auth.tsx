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
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("efectivio_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // MODO DESARROLLO: Usuario demo
      // TODO: Para producción, reemplazar esto con la autenticación real de Clerk
      if (process.env.NODE_ENV === 'development' && email === "demo@efectivio.com" && password === "demo123") {
      const newUser: User = {
        id: "1",
        name: "Juan Sánchez",
        email,
        role: "Administrador",
        initials: "JS"
      };
      
      localStorage.setItem("efectivio_user", JSON.stringify(newUser));
      setUser(newUser);
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const nameParts = name.split(" ");
      const initials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0] + (nameParts[0][1] || "");
      
      // Mock user for demonstration
      const newUser: User = {
        id: "1",
        name,
        email,
        role: "Administrador",
        initials: initials.toUpperCase()
      };
      
      localStorage.setItem("efectivio_user", JSON.stringify(newUser));
      setUser(newUser);
      setLocation("/");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("efectivio_user");
    setUser(null);
    setLocation("/login");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}