import { Link } from "wouter";
import { 
  Bell, 
  Menu, 
  Search, 
  ChevronDown, 
  Settings, 
  User, 
  LogOut,
  HelpCircle,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/protected-route";
import primaryLogo from '@/assets/primary-logo.png';

export default function Header() {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { userId, signOut } = useAuth();
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  
  const handleLogout = () => {
    if (signOut) {
      try {
        signOut();
        
        // Redirigir a la página principal tras cerrar sesión
        if (window.location.hostname === 'efectivio.com') {
          window.location.href = 'https://efectivio.com';
        } else {
          // En desarrollo, redirigimos a la raíz
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error al cerrar sesión desde header:', error);
      }
    }
  };
  
  return (
    <header className="sticky top-0 z-10 w-full bg-white shadow border-b border-gray-200">
      <div className="flex h-16 items-center justify-between w-full px-4">
        <div className="flex items-center">
          {/* Botón de menú */}
          <button
            type="button"
            className="text-gray-500 focus:outline-none hover:text-gray-700 mr-4"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Barra de búsqueda en pantallas medianas y grandes */}
          <div className="hidden md:flex items-center relative max-w-md">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="search" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 py-2 w-full border-gray-200 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-5">
          {/* Botón de búsqueda en móviles */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-400 hover:text-gray-500"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500"
                aria-label="Ver notificaciones"
              >
                <Bell className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2 px-4 text-sm text-gray-500 text-center">
                No tienes notificaciones nuevas
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mensajes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500"
                aria-label="Ver mensajes"
              >
                <Mail className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Mensajes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2 px-4 text-sm text-gray-500 text-center">
                No tienes mensajes nuevos
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logo de la empresa */}
          <div className="flex items-center">
            <img 
              src={primaryLogo} 
              alt="Efectivio" 
              className="h-5"
            />
          </div>

          {/* Selector de empresa/cliente (para cambiar el logo) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex items-center gap-1 h-9"
              >
                <span className="text-sm font-normal">Efectivio</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cambiar empresa</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setCustomLogo(null)}
                className="cursor-pointer"
              >
                Efectivio (Predeterminado)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCustomLogo("/images/dark-logo.png")}
                className="cursor-pointer"
              >
                Cliente Demo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Configurar empresas...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Perfil de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 hover:opacity-80">
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                  {userId ? 'A' : 'G'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ajustes</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ayuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-500">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
