
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAppStore } from "@/lib/store";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  
  // Forzar sidebar abierto al montar el componente
  useEffect(() => {
    // Asegurarnos de que el sidebar siempre esté abierto en el dashboard
    setSidebarOpen(true);
  }, [setSidebarOpen]);
  
  // No mostrar layout en la página de inicio o páginas de autenticación
  if (location === "/" || location.startsWith("/auth")) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - forzado a ser siempre visible */}
        <div className="flex-shrink-0 border-r border-gray-200" style={{ display: 'block', width: '16rem' }}>
          <Sidebar />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
