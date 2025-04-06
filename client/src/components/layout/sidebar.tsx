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
  Activity,
  FilePlus,
  ClipboardCheck,
  DollarSign,
  Repeat,
  FileX,
  Truck,
  ClipboardList,
  ArrowLeftRight,
  Edit3,
  RefreshCw,
  TrendingUp,
  Lock,
  PieChart
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { userId } = useAuth();
  const { isSidebarOpen } = useAppStore();
  
  // Estado para menús desplegables
  const [activeMenus, setActiveMenus] = useState<Record<string, boolean>>({
    ventas: false,
    compras: false,
    contabilidad: false,
    inventory: false,
    configuracion: false
  });
  
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

  // Panel (solo muestra el panel)
  const mainNavigation = [
    { name: 'Panel', path: '/dashboard', icon: LayoutDashboard },
  ];

  // Ventas (con acordeón)
  const ventasNavigation = [
    { name: 'Clientes', path: '/clients', icon: Users }, // Mantener path existente
    { name: 'Cotizaciones', path: '/quotes', icon: FileSpreadsheet }, // Mantener path existente
    { name: 'Facturas de anticipo', path: '/sales/advance-invoices', icon: FilePlus },
    { name: 'Órdenes de venta', path: '/sales/orders', icon: ClipboardCheck },
    { name: 'Facturas', path: '/invoices', icon: FileText }, // Mantener path existente
    { name: 'Recibos de ventas', path: '/sales/receipts', icon: Receipt },
    { name: 'Pagos recibidos', path: '/sales/payments', icon: DollarSign },
    { name: 'Facturas recurrentes', path: '/sales/recurring-invoices', icon: Repeat },
    { name: 'Notas de crédito', path: '/sales/credit-notes', icon: FileX },
  ];

  // Compras (con acordeón)
  const comprasNavigation = [
    { name: 'Proveedores', path: '/purchases/vendors', icon: Truck },
    { name: 'Gastos', path: '/expenses', icon: Receipt }, // Mantener path existente
    { name: 'Gastos recurrentes', path: '/purchases/recurring-expenses', icon: Repeat },
    { name: 'Órdenes de compra', path: '/purchases/orders', icon: ClipboardList },
    { name: 'Facturas de proveedor', path: '/purchases/bills', icon: FileText },
    { name: 'Pagos realizados', path: '/purchases/payments', icon: CreditCard },
    { name: 'Facturas de proveedor recurrentes', path: '/purchases/recurring-bills', icon: Repeat },
    { name: 'Créditos del proveedor', path: '/purchases/vendor-credits', icon: ArrowLeftRight },
  ];

  // Contabilidad (con acordeón)
  const contabilidadNavigation = [
    { name: 'Plan contable', path: '/accounting/chart-of-accounts', icon: FileSpreadsheet },
    { name: 'Asientos', path: '/accounting/entries', icon: BookOpen },
    { name: 'Balance', path: '/accounting/balance-sheet', icon: BarChart2 },
    { name: 'Estados de Resultados', path: '/accounting/income-statement', icon: FileBarChart },
    { name: 'Diarios por día', path: '/accounting/daily-journals', icon: Calendar },
    { name: 'Diarios manuales', path: '/accounting/manual-journals', icon: Edit3 },
    { name: 'Diarios recurrentes', path: '/accounting/recurring-journals', icon: Repeat },
    { name: 'Impuestos', path: '/accounting/taxes', icon: CircleDollarSign },
    { name: 'Actualización masiva', path: '/accounting/mass-update', icon: RefreshCw },
    { name: 'Ajustes de la moneda', path: '/accounting/currency-adjustment', icon: DollarSign },
    { name: 'Catálogo de cuentas', path: '/accounting/accounts-catalog', icon: BookOpen },
    { name: 'Presupuestos', path: '/accounting/budgets', icon: TrendingUp },
    { name: 'Bloqueo de transacciones', path: '/accounting/transaction-lock', icon: Lock },
  ];

  // Inventario (con acordeón)
  const inventoryNavigation = [
    { name: 'Productos', path: '/inventory/products', icon: Box },
    { name: 'Categorías', path: '/inventory/categories', icon: FileDigit },
    { name: 'Almacenes', path: '/inventory/warehouses', icon: Store },
    { name: 'Movimientos', path: '/inventory/movements', icon: ShoppingCart },
  ];

  // IA y Análisis (sin acordeón)
  const aiNavigation = [
    { name: 'Análisis de Texto', path: '/ai/text-analysis', icon: Brain },
    { name: 'Transcripciones', path: '/ai/transcriptions', icon: FileText },
    { name: 'Asistente Virtual', path: '/ai/assistant', icon: MessageSquare },
  ];

  // Configuración (con acordeón)
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
    <div className="bg-white h-full w-full flex flex-col overflow-hidden">
      <div className="p-4 flex items-center justify-center border-b border-gray-200">
        <img src={primaryLogo} alt="Efectivio" className="h-8" />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Panel */}
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

        {/* Ventas - Menú desplegable */}
        <button
          onClick={() => toggleSubMenu('ventas')}
          className="flex items-center justify-between w-full px-3 py-2 mx-2 mt-4 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-3" />
            <span>Ventas</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${activeMenus.ventas ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {activeMenus.ventas && (
          <div className="ml-5 pl-4 border-l border-gray-200 mt-1 space-y-1">
            {ventasNavigation.map((item) => (
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

        {/* Compras - Menú desplegable */}
        <button
          onClick={() => toggleSubMenu('compras')}
          className="flex items-center justify-between w-full px-3 py-2 mx-2 mt-4 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Truck className="w-5 h-5 mr-3" />
            <span>Compras</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${activeMenus.compras ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {activeMenus.compras && (
          <div className="ml-5 pl-4 border-l border-gray-200 mt-1 space-y-1">
            {comprasNavigation.map((item) => (
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

        {/* Contabilidad - Menú desplegable */}
        <button
          onClick={() => toggleSubMenu('contabilidad')}
          className="flex items-center justify-between w-full px-3 py-2 mx-2 mt-4 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 mr-3" />
            <span>Contabilidad</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${activeMenus.contabilidad ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {activeMenus.contabilidad && (
          <div className="ml-5 pl-4 border-l border-gray-200 mt-1 space-y-1">
            {contabilidadNavigation.map((item) => (
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

        {/* Inventario - Menú desplegable */}
        <button
          onClick={() => toggleSubMenu('inventory')}
          className="flex items-center justify-between w-full px-3 py-2 mx-2 mt-4 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
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

        {/* IA y Análisis - Enlaces directos */}
        <div className="mt-4">
        {aiNavigation.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
              location === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-50'
            } mt-1`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
        </div>

        {/* Portal del Cliente - Enlace directo */}
        <Link
          href="/client-portal"
          className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
            location === '/client-portal'
              ? 'bg-primary/10 text-primary'
              : 'text-gray-700 hover:bg-gray-50'
          } mt-4`}
        >
          <Users className="w-5 h-5 mr-3" />
          Portal del Cliente
        </Link>

        {/* Informes - Enlace directo */}
        <Link
          href="/reports"
          className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
            location === '/reports'
              ? 'bg-primary/10 text-primary'
              : 'text-gray-700 hover:bg-gray-50'
          } mt-4`}
        >
          <PieChart className="w-5 h-5 mr-3" />
          Informes
        </Link>

        {/* Efectivio Drive - Enlace directo */}
        <Link
          href="/files"
          className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
            location === '/files'
              ? 'bg-primary/10 text-primary'
              : 'text-gray-700 hover:bg-gray-50'
          } mt-4`}
        >
          <HardDrive className="w-5 h-5 mr-3" />
          Efectivio Drive
        </Link>

        {/* Configuración - Menú desplegable */}
        <button
          onClick={() => toggleSubMenu('configuracion')}
          className="flex items-center justify-between w-full px-3 py-2 mx-2 mt-4 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Settings2 className="w-5 h-5 mr-3" />
            <span>Configuración</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${activeMenus.configuracion ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {activeMenus.configuracion && (
          <div className="ml-5 pl-4 border-l border-gray-200 mt-1 space-y-1">
            {configNavigation.map((item) => (
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
      </nav>
      
      {/* Se ha eliminado "Powered by" y movido al Footer */}
    </div>
  );
}