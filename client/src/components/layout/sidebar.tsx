import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
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
  FileSpreadsheet
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clients', icon: Users },
    { name: 'Facturas', path: '/invoices', icon: FileText },
    { name: 'Gastos', path: '/expenses', icon: Receipt },
    { name: 'Productos', path: '/productos', icon: ShoppingCart },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Mensajes', path: '/messages', icon: MessageSquare },
  ];

  const contabilidadNavigation = [
    { name: 'Plan Contable', path: '/accounting/chart-of-accounts', icon: FileSpreadsheet },
    { name: 'Asientos', path: '/accounting/entries', icon: BookOpen },
    { name: 'Balance', path: '/accounting/balance-sheet', icon: BarChart2 },
    { name: 'Estado de Resultados', path: '/accounting/income-statement', icon: FileBarChart },
    { name: 'Diario', path: '/accounting/journal', icon: FileText },
  ];

  const configNavigation = [
    { name: 'Empresa', path: '/company', icon: Building2 },
    { name: 'Ajustes', path: '/settings', icon: Settings },
    { name: 'Usuarios', path: '/users', icon: UserCog },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 flex items-center border-b border-gray-200">
        <img src="/images/primary-logo.png" alt="Efectivio" className="h-8" />
      </div>

      <div className="border-b border-gray-200 py-4 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
            {user?.initials || 'U'}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{user?.name || 'Usuario'}</div>
            <div className="text-sm text-gray-500">{user?.role || 'Invitado'}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Principal</div>
        {navigation.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm ${
              location === item.path
                ? 'bg-primary-50 text-primary-600'
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
                ? 'bg-primary-50 text-primary-600'
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
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}