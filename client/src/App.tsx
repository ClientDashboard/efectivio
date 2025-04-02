import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/auth-provider";

// Pages
import LandingPage from "@/pages/landing-page";
import DashboardPage from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import ClientCreatePage from "@/pages/clients/create";
import InvoicesPage from "@/pages/invoices";
import InvoiceCreatePage from "@/pages/invoices/create";
import ExpensesPage from "@/pages/expenses";
import ExpenseCreatePage from "@/pages/expenses/create";
import EntriesPage from "@/pages/accounting/entries";
import ChartOfAccountsPage from "@/pages/accounting/chart-of-accounts";
import JournalPage from "@/pages/accounting/journal";
import BalanceSheetPage from "@/pages/accounting/balance-sheet";
import IncomeStatementPage from "@/pages/accounting/income-statement";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Lista de rutas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/clients',
    '/clients/create',
    '/invoices',
    '/invoices/create',
    '/expenses',
    '/expenses/create',
    '/accounting/entries',
    '/accounting/chart-of-accounts',
    '/accounting/journal',
    '/accounting/balance-sheet',
    '/accounting/income-statement',
  ];
  
  // Verificar si la ruta actual requiere autenticación
  const requiresAuth = protectedRoutes.some(route => 
    location === route || location.startsWith(`${route}/`)
  );
  
  // Redirigir a login si se intenta acceder a una ruta protegida sin autenticación
  if (requiresAuth && !isLoading && !isAuthenticated) {
    window.location.href = '/auth/sign-in';
    return null;
  }
  
  // Mostrar las rutas protegidas si el usuario está autenticado
  if (requiresAuth && isAuthenticated) {
    return (
      <Switch>
        {/* Dashboard */}
        <Route path="/dashboard" component={DashboardPage} />
        
        {/* Clients */}
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/create" component={ClientCreatePage} />
        
        {/* Invoices */}
        <Route path="/invoices" component={InvoicesPage} />
        <Route path="/invoices/create" component={InvoiceCreatePage} />
        
        {/* Expenses */}
        <Route path="/expenses" component={ExpensesPage} />
        <Route path="/expenses/create" component={ExpenseCreatePage} />
        
        {/* Accounting */}
        <Route path="/accounting/entries" component={EntriesPage} />
        <Route path="/accounting/chart-of-accounts" component={ChartOfAccountsPage} />
        <Route path="/accounting/journal" component={JournalPage} />
        <Route path="/accounting/balance-sheet" component={BalanceSheetPage} />
        <Route path="/accounting/income-statement" component={IncomeStatementPage} />
        
        {/* Fallback para rutas protegidas */}
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // Rutas públicas
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={LandingPage} />
      
      {/* Auth Pages - Usando páginas personalizadas que implementan los componentes de Clerk */}
      <Route path="/auth/sign-in" component={SignInPage} />
      <Route path="/auth/sign-up" component={SignUpPage} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
