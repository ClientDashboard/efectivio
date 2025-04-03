import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const isDevelopment = process.env.NODE_ENV === 'development'; // Add development flag

  useEffect(() => {
    // Redirect to login if not authenticated and not in development mode
    if (!isLoading && !user && location !== '/login' && location !== '/register' && !isDevelopment) {
      setLocation('/login');
    }
  }, [user, isLoading, location, setLocation, isDevelopment]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button type="button" id="mobile-menu-button" className="text-gray-700 mr-3">
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="text-xl font-semibold text-primary-500">Efectivio</div>
        </div>
        <div className="flex items-center space-x-3">
          <button type="button" className="text-gray-700">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
            {user?.initials || 'U'} {/*added default value to avoid error if user is null*/}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {isDevelopment || user ? <Sidebar /> : null} {/* Conditionally render Sidebar */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-0">
          <Header />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}