import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/protected-route';
import { useAppStore } from '@/lib/store';
import primaryLogo from '@/assets/primary-logo.png';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  ShoppingCart,
  BookOpen,
  BarChart2,
  FileBarChart,
  Settings,
  UserCog,
  LogOut,
  Building2,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  Brain,
  ChevronDown,
  CreditCard,
  Box,
  Settings2,
  ListTodo,
  Clock,
  FolderArchive,
  Video,
  FileDigit,
  Briefcase,
  CircleDollarSign,
  Database,
  HardDrive,
  Shield,
  Store,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { userId } = useAuth();
  const { isSidebarOpen } = useAppStore();
  
  // Estado para menús desplegables
  const [activeMenus, setActiveMenus] = useState<Record<string, boolean>>({
    clientPortal: false,
    inventory: false
  });
  
  // Datos de usuario para la interfaz (en un sistema real, estos datos vendrían de la base de datos)
  const user = {
    name: 'Administrador',
    initials: 'A',
    role: 'Administrador'
  };
  
  // Si el sidebar no está abierto (aunque debería estarlo siempre), no renderizar nada
  if (!isSidebarOpen) {
    return null;
  }

  const toggleSubMenu = (menuName: string) => {
    setActiveMenus({
      ...activeMenus,
      [menuName]: !activeMenus[menuName]
    });
  };

  const mainNavigation = [
    { name: 'Panel', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clients', icon: Users },
    { name: 'Cotizaciones', path: '/quotes', icon: FileSpreadsheet },
    { name: 'Facturas', path: '/invoices', icon: FileText },
    { name: 'Gastos', path: '/expenses', icon: Receipt },
    { name: 'Productos', path: '/products', icon: ShoppingCart },
    { name: 'Efectivio Drive', path: '/files', icon: HardDrive },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Mensajes', path: '/messages', icon: MessageSquare },
  ];

  const contabilidadNavigation = [
    { name: 'Plan Contable', path: '/accounting/chart-of-accounts', icon: FileSpreadsheet },
    { name: 'Asientos', path: '/accounting/entries', icon: BookOpen },
    { name: 'Balance', path: '/accounting/balance-sheet', icon: BarChart2 },
    { name: 'Estado de Resultados', path: '/accounting/income-statement', icon: FileBarChart },
    { name: 'Diario', path: '/accounting/journal', icon: FileText },
    { name: 'Impuestos', path: '/accounting/taxes', icon: CircleDollarSign },
  ];

  // Ya no usamos el menú desplegable para Portal del Cliente
  const clientPortalNavigation: { name: string; path: string; icon: any }[] = [];

  const inventoryNavigation = [
    { name: 'Productos', path: '/inventory/products', icon: Box },
    { name: 'Categorías', path: '/inventory/categories', icon: FileDigit },
    { name: 'Almacenes', path: '/inventory/warehouses', icon: Store },
    { name: 'Movimientos', path: '/inventory/movements', icon: ShoppingCart },
  ];

  const aiNavigation = [
    { name: 'Análisis de Texto', path: '/ai/text-analysis', icon: Brain },
    { name: 'Transcripciones', path: '/ai/transcriptions', icon: FileText },
    { name: 'Asistente Virtual', path: '/ai/assistant', icon: MessageSquare },
  ];

  const configNavigation = [
    { name: 'Configuración', path: '/settings', icon: Settings2 },
    { name: 'Empresa', path: '/settings/company', icon: Building2 },
    { name: 'Seguridad', path: '/settings/security', icon: Shield },
    { name: 'Respaldo', path: '/settings/backup', icon: Database },
    { name: 'Almacenamiento', path: '/settings/storage', icon: HardDrive },
    { name: 'Usuarios', path: '/users', icon: UserCog },
    { name: 'General', path: '/settings/general', icon: Settings },
    { name: 'Registros de Auditoría', path: '/audit', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 flex items-center justify-center border-b border-gray-200">
        <img src={primaryLogo} alt="Efectivio" className="h-10" />
      </div>

      <div className="border-b border-gray-200 py-4 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
            {user?.initials || 'U'}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{user?.name || 'Usuario'}</div>
            <div className="text-sm text-gray-500">{user?.role || 'Administrador'}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Principal</div>
        {mainNavigation.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
              location === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}

        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">Contabilidad</div>
        {contabilidadNavigation.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
              location === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}

        {/* Portal del Cliente - Enlace directo */}
        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">Portal del Cliente</div>
        <Link
          href="/client-portal"
          className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
            location === '/client-portal'
              ? 'bg-primary/10 text-primary'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          Portal del Cliente
        </Link>

        {/* Inventario - Menú desplegable */}
        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">Inventario</div>
        <button
          onClick={() => toggleSubMenu('inventory')}
          className="flex items-center justify-between w-full px-3 py-2 mx-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Box className="w-5 h-5 mr-3" />
            <span>Inventario</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${activeMenus.inventory ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {activeMenus.inventory && (
          <div className="ml-5 pl-4 border-l border-gray-200 mt-1 space-y-1">
            {inventoryNavigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                  location === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">IA y Análisis</div>
        {aiNavigation.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
              location === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}

        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">Configuración</div>
        {configNavigation.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
              location === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500 mb-2">Powered by:</p>
          <img src={primaryLogo} alt="Efectivio" className="h-7" />
        </div>
      </div>
    </aside>
  );
}
