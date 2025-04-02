import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "./lib/clerk-provider";
import { 
  SignIn, 
  SignUp, 
  SignedIn, 
  SignedOut, 
  RedirectToSignIn
} from "@clerk/clerk-react";

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
  
  // Componente de Clerk para redirigir en caso de no estar autenticado
  if (requiresAuth) {
    return (
      <SignedIn>
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
      </SignedIn>
    );
  }
  
  // Rutas públicas
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={LandingPage} />
      
      {/* Auth Pages - Estas páginas serán manejadas por los componentes de Clerk */}
      <Route path="/auth/sign-in">
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          <SignIn redirectUrl="/dashboard" />
        </div>
      </Route>
      
      <Route path="/auth/sign-up">
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          <SignUp redirectUrl="/dashboard" />
        </div>
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
