import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Handle mobile menu button click
    const handleMobileMenuClick = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', handleMobileMenuClick);
    }

    return () => {
      if (mobileMenuButton) {
        mobileMenuButton.removeEventListener('click', handleMobileMenuClick);
      }
    };
  }, [isMobileMenuOpen]);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: 'ri-dashboard-line' },
    { name: 'Clientes', path: '/clientes', icon: 'ri-user-line' },
    { name: 'Facturas', path: '/facturas', icon: 'ri-bill-line' },
    { name: 'Gastos', path: '/gastos', icon: 'ri-shopping-bag-3-line' },
    { name: 'Productos', path: '/productos', icon: 'ri-shopping-cart-line' },
  ];

  const contabilidadNavigation = [
    { name: 'Asientos Contables', path: '/asientos', icon: 'ri-book-open-line' },
    { name: 'Contabilidad', path: '/contabilidad', icon: 'ri-bar-chart-box-line' },
    { name: 'Informes', path: '/informes', icon: 'ri-file-chart-line' },
  ];

  const configNavigation = [
    { name: 'Ajustes', path: '/ajustes', icon: 'ri-settings-line' },
    { name: 'Usuarios', path: '/usuarios', icon: 'ri-user-settings-line' },
  ];

  const sidebarClasses = isMobileMenuOpen
    ? 'w-64 bg-white border-r border-gray-200 lg:block fixed inset-0 z-40 lg:static'
    : 'w-64 bg-white border-r border-gray-200 hidden lg:block';

  return (
    <aside id="sidebar" className={sidebarClasses}>
      <div className="p-4 flex items-center border-b border-gray-200">
        <span className="text-2xl font-bold text-primary-500">Efectivio</span>
      </div>
      
      {/* User Profile */}
      <div className="border-b border-gray-200 py-4 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium mr-3">
            {user?.initials || 'US'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user?.name || 'Usuario'}</div>
            <div className="text-sm text-gray-500">{user?.role || 'Invitado'}</div>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Principal</div>
        
        {navigation.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`sidebar-link flex items-center py-2 px-4 hover:bg-gray-100 transition-colors duration-200 ${
              location === item.path 
                ? 'active text-primary-500' 
                : 'text-gray-700'
            }`}
          >
            <i className={`${item.icon} mr-3 text-lg`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contabilidad</div>
        
        {contabilidadNavigation.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`sidebar-link flex items-center py-2 px-4 hover:bg-gray-100 transition-colors duration-200 ${
              location === item.path 
                ? 'active text-primary-500' 
                : 'text-gray-700'
            }`}
          >
            <i className={`${item.icon} mr-3 text-lg`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuración</div>
        
        {configNavigation.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`sidebar-link flex items-center py-2 px-4 hover:bg-gray-100 transition-colors duration-200 ${
              location === item.path 
                ? 'active text-primary-500' 
                : 'text-gray-700'
            }`}
          >
            <i className={`${item.icon} mr-3 text-lg`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <button 
          onClick={logout}
          className="w-full flex items-center py-2 px-4 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded"
        >
          <i className="ri-logout-box-line mr-3 text-lg"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
