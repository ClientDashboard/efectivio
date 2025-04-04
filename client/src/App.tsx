import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "./lib/clerk-provider";
import { ProtectedRoute, PublicRoute } from "./lib/protected-route";
import { Loader2 } from "lucide-react";

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
import ResetPasswordPage from "@/pages/auth/reset-password";
import TextAnalysisPage from "@/pages/ai/text-analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
