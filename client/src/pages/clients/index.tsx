import { useState } from "react";
import { Link, useLocation } from "wouter";
import DataTable, { Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { User, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Client {
  id: number;
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  createdAt: string;
}

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
      header: "Empresa",
      accessorKey: "companyName",
    },
    {
      header: "Contacto",
      accessorKey: "contactName",
      cell: (client) => client.contactName || "—",
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (client) => client.email || "—",
    },
    {
      header: "Teléfono",
      accessorKey: "phone",
      cell: (client) => client.phone || "—",
    },
    {
      header: "ID Fiscal",
      accessorKey: "taxId",
      cell: (client) => client.taxId || "—",
    },
    {
      header: "Fecha de registro",
      accessorKey: "createdAt",
      cell: (client) => formatDate(client.createdAt),
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (client) => (
        <div className="flex space-x-2">
          <Link href={`/clients/${client.id}`}>
            <Button variant="outline" size="sm">
              Ver
            </Button>
          </Link>
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
