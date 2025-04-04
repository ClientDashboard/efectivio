
import { ReactNode } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAppStore } from "@/lib/store";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { isSidebarOpen } = useAppStore();
  
  // No mostrar layout en la página de inicio o páginas de autenticación
  if (location === "/" || location.startsWith("/auth")) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - visible en todas las pantallas cuando está abierto */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block flex-shrink-0 transition-all duration-300`}>
          <Sidebar />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
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
