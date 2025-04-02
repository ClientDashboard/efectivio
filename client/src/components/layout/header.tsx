import { Link } from "wouter";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, useUserStore } from "@/lib/store";

export default function Header() {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { user, clearUser } = useUserStore();
  
  const handleLogout = () => {
    clearUser();
    window.location.href = '/auth/sign-in';
  };
  
  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between md:px-6">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Efectivio
          </h1>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <div className="ml-3 relative flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {user ? user.fullName || user.username : 'Guest'}
            </div>
            
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user ? (user.fullName?.charAt(0) || user.username.charAt(0)).toUpperCase() : 'G'}
            </div>
            
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Salir
              </Button>
            ) : (
              <Link href="/auth/sign-in">
                <Button size="sm">
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
