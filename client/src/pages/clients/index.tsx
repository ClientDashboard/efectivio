import { useState } from "react";
import { Link, useLocation } from "wouter";
import DataTable, { Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { User, Plus, PenSquare, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Client } from "@shared/schema";
import { DeleteClientConfirmation } from "@/components/clients/delete-client-confirmation";

export default function ClientsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    retry: 1,
    gcTime: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const columns: Column<Client>[] = [
    {
      header: "Empresa/Cliente",
      accessorKey: "name",
      cell: (client) => client.companyName || client.name || "—",
    },
    {
      header: "Contacto",
      accessorKey: "displayName",
      cell: (client) => {
        // Si es una empresa, mostrar el nombre de contacto
        if (client.clientType === "company") {
          return client.displayName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || "—";
        }
        // Si es un individuo, mostrar su nombre completo
        return `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.displayName || "—";
      }
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (client) => client.email || "—",
    },
    {
      header: "Teléfono",
      accessorKey: "workPhone",
      cell: (client) => client.workPhone || client.mobilePhone || "—",
    },
    {
      header: "ID Fiscal",
      accessorKey: "taxId",
      cell: (client) => client.taxId || "—",
    },
    {
      header: "Fecha de registro",
      accessorKey: "createdAt",
      cell: (client) => client.createdAt ? formatDate(client.createdAt.toString()) : "—",
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (client) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link href={`/clients/${client.id}`}>
            <Button variant="outline" size="sm">
              <PenSquare className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <DeleteClientConfirmation client={client}>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DeleteClientConfirmation>
        </div>
      ),
    },
  ];

  // Handle row click to navigate to client detail
  const handleRowClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona la información de tus clientes</p>
        </div>
        <Link href="/clients/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando clientes...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-red-500">Error al cargar los clientes</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !clients || clients.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay clientes registrados</h3>
              <p className="text-gray-500 mt-1 mb-4">Comienza agregando tu primer cliente</p>
              <Link href="/clients/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </Link>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={clients} 
              onRowClick={handleRowClick}
              keyField="id"
              searchable={true}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
