import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "./lib/clerk-provider";
import { ProtectedRoute, PublicRoute, useAuth } from "./lib/protected-route";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAppStore } from "./lib/store";

// Importación del layout
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

// Pages
import LandingPage from "@/pages/landing-page";
import DashboardPage from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import ClientCreatePage from "@/pages/clients/create";
import QuotesPage from "@/pages/quotes";
import QuoteCreatePage from "@/pages/quotes/create";
import InvoicesPage from "@/pages/invoices";
import InvoiceCreatePage from "@/pages/invoices/create";
import ExpensesPage from "@/pages/expenses";
import ExpenseCreatePage from "@/pages/expenses/create";
import FilesPage from "@/pages/files-page";
import EntriesPage from "@/pages/accounting/entries";
import ChartOfAccountsPage from "@/pages/accounting/chart-of-accounts";
import JournalPage from "@/pages/accounting/journal";
import BalanceSheetPage from "@/pages/accounting/balance-sheet";
import IncomeStatementPage from "@/pages/accounting/income-statement";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import ResetPasswordPage from "@/pages/auth/reset-password";
import TextAnalysisPage from "@/pages/ai/text-analysis";
import NotFound from "@/pages/not-found";

// Componente de layout para todas las páginas autenticadas
function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { setSidebarOpen } = useAppStore();
  const { userId } = useAuth();
  
  // Forzar que el sidebar esté abierto siempre en las rutas autenticadas
  useEffect(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);
  
  // No mostrar el layout en páginas públicas o de autenticación
  if (location === "/" || location.startsWith("/auth") || !userId) {
    return <>{children}</>;
  }

  // Layout principal para páginas autenticadas
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        {/* Rutas públicas (no requieren autenticación) */}
        <Route path="/" component={LandingPage} />
        <Route path="/auth/reset-password" component={ResetPasswordPage} />
        
        {/* Auth Pages - Solo accesibles si NO está autenticado */}
        <PublicRoute path="/auth/sign-in">
          <SignInPage />
        </PublicRoute>
        
        <PublicRoute path="/auth/sign-up">
          <SignUpPage />
        </PublicRoute>
        
        {/* Rutas protegidas - Requieren autenticación */}
        <ProtectedRoute path="/dashboard">
          <DashboardPage />
        </ProtectedRoute>
        
        {/* Clients */}
        <ProtectedRoute path="/clients">
          <ClientsPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/clients/create">
          <ClientCreatePage />
        </ProtectedRoute>
        
        {/* Quotes */}
        <ProtectedRoute path="/quotes">
          <QuotesPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/quotes/create">
          <QuoteCreatePage />
        </ProtectedRoute>
        
        {/* Invoices */}
        <ProtectedRoute path="/invoices">
          <InvoicesPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/invoices/create">
          <InvoiceCreatePage />
        </ProtectedRoute>
        
        {/* Expenses */}
        <ProtectedRoute path="/expenses">
          <ExpensesPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/expenses/create">
          <ExpenseCreatePage />
        </ProtectedRoute>
        
        {/* Files */}
        <ProtectedRoute path="/files">
          <FilesPage />
        </ProtectedRoute>
        
        {/* Accounting */}
        <ProtectedRoute path="/accounting/entries">
          <EntriesPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/accounting/chart-of-accounts">
          <ChartOfAccountsPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/accounting/journal">
          <JournalPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/accounting/balance-sheet">
          <BalanceSheetPage />
        </ProtectedRoute>
        
        <ProtectedRoute path="/accounting/income-statement">
          <IncomeStatementPage />
        </ProtectedRoute>
        
        {/* AI Tools */}
        <ProtectedRoute path="/ai/text-analysis">
          <TextAnalysisPage />
        </ProtectedRoute>
        
        {/* Fallback para cualquier otra ruta */}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ClerkProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </HelmetProvider>
  );
}

export default App;
