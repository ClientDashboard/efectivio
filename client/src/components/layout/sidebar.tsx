import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  ClipboardList,
  BarChart4,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ href, icon, label, active }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-2 py-2 text-sm font-medium rounded-md group w-full",
        active
          ? "bg-primary-800 text-white"
          : "text-gray-300 hover:bg-primary-700 hover:text-white"
      )}
    >
      <div className="mr-3 h-6 w-6 flex-shrink-0">{icon}</div>
      <span className="truncate">{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "bg-primary-900 flex-shrink-0 h-full transition-all duration-300 ease-in-out hidden md:flex",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex flex-col w-full">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-950">
            <div className="flex items-center justify-between w-full">
              {isSidebarOpen && (
                <div className="flex items-center">
                  <svg className="h-8 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-white">Efectivio</span>
                </div>
              )}
              
              {!isSidebarOpen && (
                <div className="mx-auto">
                  <svg className="h-8 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                  </svg>
                </div>
              )}
              
              <button 
                onClick={toggleSidebar}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-2 space-y-1">
              <div className={cn(isSidebarOpen ? "" : "flex flex-col items-center space-y-3")}>
                {!isSidebarOpen ? (
                  // Collapsed sidebar
                  <>
                    <Link href="/dashboard" className={cn(
                      "p-2 rounded-md",
                      location === "/dashboard" 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <LayoutDashboard className="h-6 w-6" />
                    </Link>
                    
                    <Link href="/clients" className={cn(
                      "p-2 rounded-md",
                      location.startsWith("/clients") 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <Users className="h-6 w-6" />
                    </Link>
                    
                    <Link href="/invoices" className={cn(
                      "p-2 rounded-md",
                      location.startsWith("/invoices") 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <FileText className="h-6 w-6" />
                    </Link>
                    
                    <Link href="/expenses" className={cn(
                      "p-2 rounded-md",
                      location.startsWith("/expenses") 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <DollarSign className="h-6 w-6" />
                    </Link>
                    
                    <Link href="/accounting/entries" className={cn(
                      "p-2 rounded-md",
                      location.startsWith("/accounting") 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <ClipboardList className="h-6 w-6" />
                    </Link>
                    
                    <Link href="/reports" className={cn(
                      "p-2 rounded-md",
                      location.startsWith("/reports") 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <BarChart4 className="h-6 w-6" />
                    </Link>
                    
                    <Link href="/settings" className={cn(
                      "p-2 rounded-md",
                      location.startsWith("/settings") 
                        ? "bg-primary-800 text-white" 
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}>
                      <Settings className="h-6 w-6" />
                    </Link>
                  </>
                ) : (
                  // Expanded sidebar
                  <>
                    <NavItem 
                      href="/dashboard" 
                      icon={<LayoutDashboard className="h-6 w-6" />} 
                      label="Dashboard" 
                      active={location === "/dashboard"}
                    />
                    
                    <NavItem 
                      href="/clients" 
                      icon={<Users className="h-6 w-6" />} 
                      label="Clientes" 
                      active={location.startsWith("/clients")}
                    />
                    
                    <NavItem 
                      href="/invoices" 
                      icon={<FileText className="h-6 w-6" />} 
                      label="Facturas" 
                      active={location.startsWith("/invoices")}
                    />
                    
                    <NavItem 
                      href="/expenses" 
                      icon={<DollarSign className="h-6 w-6" />} 
                      label="Gastos" 
                      active={location.startsWith("/expenses")}
                    />
                    
                    <div className="mt-8">
                      <h3 className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Contabilidad
                      </h3>
                      
                      <div className="mt-2 space-y-1">
                        <NavItem 
                          href="/accounting/entries" 
                          icon={<ClipboardList className="h-6 w-6" />} 
                          label="Asientos Contables" 
                          active={location === "/accounting/entries"}
                        />
                        
                        <NavItem 
                          href="/accounting/chart-of-accounts" 
                          icon={<ClipboardList className="h-6 w-6" />} 
                          label="Plan de Cuentas" 
                          active={location === "/accounting/chart-of-accounts"}
                        />
                        
                        <NavItem 
                          href="/accounting/journal" 
                          icon={<ClipboardList className="h-6 w-6" />} 
                          label="Libro Diario" 
                          active={location === "/accounting/journal"}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Reportes
                      </h3>
                      
                      <div className="mt-2 space-y-1">
                        <NavItem 
                          href="/accounting/balance-sheet" 
                          icon={<BarChart4 className="h-6 w-6" />} 
                          label="Balance General" 
                          active={location === "/accounting/balance-sheet"}
                        />
                        
                        <NavItem 
                          href="/accounting/income-statement" 
                          icon={<BarChart4 className="h-6 w-6" />} 
                          label="Estado de Resultados" 
                          active={location === "/accounting/income-statement"}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <NavItem 
                        href="/settings" 
                        icon={<Settings className="h-6 w-6" />} 
                        label="Configuración" 
                        active={location.startsWith("/settings")}
                      />
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => useAppStore.setState({ isSidebarOpen: false })}
        />
      )}
      
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 transition-transform transform md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-primary-950">
          <div className="flex items-center">
            <svg className="h-8 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-white">Efectivio</span>
          </div>
          <button
            onClick={() => useAppStore.setState({ isSidebarOpen: false })}
            className="text-gray-300 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            <NavItem 
              href="/dashboard" 
              icon={<LayoutDashboard className="h-6 w-6" />} 
              label="Dashboard" 
              active={location === "/dashboard"}
            />
            
            <NavItem 
              href="/clients" 
              icon={<Users className="h-6 w-6" />} 
              label="Clientes" 
              active={location.startsWith("/clients")}
            />
            
            <NavItem 
              href="/invoices" 
              icon={<FileText className="h-6 w-6" />} 
              label="Facturas" 
              active={location.startsWith("/invoices")}
            />
            
            <NavItem 
              href="/expenses" 
              icon={<DollarSign className="h-6 w-6" />} 
              label="Gastos" 
              active={location.startsWith("/expenses")}
            />
            
            <div className="mt-8">
              <h3 className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Contabilidad
              </h3>
              
              <div className="mt-2 space-y-1">
                <NavItem 
                  href="/accounting/entries" 
                  icon={<ClipboardList className="h-6 w-6" />} 
                  label="Asientos Contables" 
                  active={location === "/accounting/entries"}
                />
                
                <NavItem 
                  href="/accounting/chart-of-accounts" 
                  icon={<ClipboardList className="h-6 w-6" />} 
                  label="Plan de Cuentas" 
                  active={location === "/accounting/chart-of-accounts"}
                />
                
                <NavItem 
                  href="/accounting/journal" 
                  icon={<ClipboardList className="h-6 w-6" />} 
                  label="Libro Diario" 
                  active={location === "/accounting/journal"}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Reportes
              </h3>
              
              <div className="mt-2 space-y-1">
                <NavItem 
                  href="/accounting/balance-sheet" 
                  icon={<BarChart4 className="h-6 w-6" />} 
                  label="Balance General" 
                  active={location === "/accounting/balance-sheet"}
                />
                
                <NavItem 
                  href="/accounting/income-statement" 
                  icon={<BarChart4 className="h-6 w-6" />} 
                  label="Estado de Resultados" 
                  active={location === "/accounting/income-statement"}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <NavItem 
                href="/settings" 
                icon={<Settings className="h-6 w-6" />} 
                label="Configuración" 
                active={location.startsWith("/settings")}
              />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
