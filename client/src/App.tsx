import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth-provider";
import { ProtectedRoute, PublicOnlyRoute } from "./lib/protected-route";

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
  return (
    <Switch>
      {/* Rutas públicas */}
      <Route path="/" component={LandingPage} />
      
      {/* Auth Pages - Solo accesibles si NO está autenticado */}
      <Route path="/auth/sign-in">
        <PublicOnlyRoute redirectTo="/dashboard">
          <SignInPage />
        </PublicOnlyRoute>
      </Route>
      
      <Route path="/auth/sign-up">
        <PublicOnlyRoute redirectTo="/dashboard">
          <SignUpPage />
        </PublicOnlyRoute>
      </Route>
      
      {/* Rutas protegidas - Requieren autenticación */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      
      {/* Clients */}
      <Route path="/clients">
        <ProtectedRoute>
          <ClientsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients/create">
        <ProtectedRoute>
          <ClientCreatePage />
        </ProtectedRoute>
      </Route>
      
      {/* Invoices */}
      <Route path="/invoices">
        <ProtectedRoute>
          <InvoicesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/invoices/create">
        <ProtectedRoute>
          <InvoiceCreatePage />
        </ProtectedRoute>
      </Route>
      
      {/* Expenses */}
      <Route path="/expenses">
        <ProtectedRoute>
          <ExpensesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/expenses/create">
        <ProtectedRoute>
          <ExpenseCreatePage />
        </ProtectedRoute>
      </Route>
      
      {/* Accounting */}
      <Route path="/accounting/entries">
        <ProtectedRoute>
          <EntriesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/accounting/chart-of-accounts">
        <ProtectedRoute>
          <ChartOfAccountsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/accounting/journal">
        <ProtectedRoute>
          <JournalPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/accounting/balance-sheet">
        <ProtectedRoute>
          <BalanceSheetPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/accounting/income-statement">
        <ProtectedRoute>
          <IncomeStatementPage />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback para cualquier otra ruta */}
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
