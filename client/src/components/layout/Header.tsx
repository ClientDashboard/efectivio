import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Set page title based on current route
    switch (location) {
      case '/':
        setPageTitle('Dashboard');
        break;
      case '/clientes':
        setPageTitle('Clientes');
        break;
      case '/facturas':
        setPageTitle('Facturas');
        break;
      case '/gastos':
        setPageTitle('Gastos');
        break;
      case '/productos':
        setPageTitle('Productos');
        break;
      case '/asientos':
        setPageTitle('Asientos Contables');
        break;
      case '/contabilidad':
        setPageTitle('Contabilidad');
        break;
      case '/informes':
        setPageTitle('Informes');
        break;
      case '/ajustes':
        setPageTitle('Ajustes');
        break;
      case '/usuarios':
        setPageTitle('Usuarios');
        break;
      default:
        setPageTitle('Dashboard');
    }
  }, [location]);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 hidden lg:flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        <button type="button" className="text-gray-700 relative">
          <i className="ri-notification-3-line text-xl"></i>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center">
          <div className="mr-3 text-right">
            <div className="font-medium text-gray-900">{user?.name || 'Usuario'}</div>
            <div className="text-sm text-gray-500">{user?.email || 'usuario@ejemplo.com'}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
            {user?.initials || 'US'}
          </div>
        </div>
      </div>
    </header>
  );
}
