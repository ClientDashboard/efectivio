
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
  
  // Don't show layout on landing page or auth pages
  if (location === "/" || location.startsWith("/auth")) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 ml-64 overflow-hidden">
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
  );
}
