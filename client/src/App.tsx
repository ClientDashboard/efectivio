import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Clientes from "@/pages/clientes";
import Facturas from "@/pages/facturas";
import Gastos from "@/pages/gastos";
import Productos from "@/pages/productos";
import Asientos from "@/pages/asientos";
import Contabilidad from "@/pages/contabilidad";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      
      <Route path="/clientes">
        <Layout>
          <Clientes />
        </Layout>
      </Route>
      
      <Route path="/facturas">
        <Layout>
          <Facturas />
        </Layout>
      </Route>
      
      <Route path="/gastos">
        <Layout>
          <Gastos />
        </Layout>
      </Route>
      
      <Route path="/productos">
        <Layout>
          <Productos />
        </Layout>
      </Route>
      
      <Route path="/asientos">
        <Layout>
          <Asientos />
        </Layout>
      </Route>
      
      <Route path="/contabilidad">
        <Layout>
          <Contabilidad />
        </Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
