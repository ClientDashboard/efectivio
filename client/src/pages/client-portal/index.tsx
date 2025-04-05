import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Client } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Upload, FolderPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClientPortalPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('todos');

  // Consulta para obtener los clientes con acceso al portal
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    select: (data) => data.filter(client => client.hasPortalAccess === true)
  });

  // Manejador de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    if (clients) {
      setFilteredClients(
        clients.filter((client) =>
          client.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [clients, searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-6">
      <Helmet>
        <title>Portal del Cliente | Efectivio</title>
      </Helmet>

      <div className="flex justify-between items-start mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Portal del Cliente
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestione los accesos y documentos para sus clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="hidden sm:flex"
            onClick={() => setLocation('/clients/create')}
          >
            <Users className="mr-2 h-4 w-4" /> Agregar Cliente
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="activos">Activos</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="w-full px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="todos" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients && filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Sin clientes con acceso al portal</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No hay clientes con acceso al portal. Habilite el acceso al portal en la configuración del cliente.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation('/clients')}
              >
                Ver Clientes
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activos" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Próximamente</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta sección mostrará clientes que ya han accedido al portal.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pendientes" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Próximamente</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta sección mostrará clientes que tienen pendiente su registro.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ClientCardProps {
  client: Client;
}

function ClientCard({ client }: ClientCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{client.displayName || client.companyName}</CardTitle>
          <Badge variant={client.isActive ? "default" : "secondary"}>
            {client.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <CardDescription>
          {client.email && (
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              {client.email}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col gap-2">
          {client.companyName && client.clientType === "company" && (
            <div className="text-sm">
              <span className="font-medium">Empresa:</span> {client.companyName}
            </div>
          )}
          {client.firstName && client.lastName && (
            <div className="text-sm">
              <span className="font-medium">Contacto:</span> {client.firstName} {client.lastName}
            </div>
          )}
          {client.workPhone && (
            <div className="text-sm">
              <span className="font-medium">Teléfono:</span> {client.workPhone}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/client-portal/${client.id}/dashboard`}>
            Ver Portal
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/client-portal/${client.id}/files`}>
            <FolderPlus className="mr-1 h-4 w-4" /> Archivos
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}