import { useState } from "react";
import { Link, useLocation } from "wouter";

import DataTable, { Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: string;
  taxAmount: string;
  total: string;
}

interface Client {
  id: number;
  companyName: string;
}

export default function InvoicesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar facturas",
        description: "No se pudieron cargar las facturas. Intente de nuevo más tarde.",
      });
    }
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    onError: (err) => {
      console.error("Error loading clients:", err);
    }
  });

  // Get client name by id
  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.companyName : "Cliente desconocido";
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "default";
    let statusLabel = "";

    switch (status) {
      case "draft":
        badgeVariant = "secondary";
        statusLabel = "Borrador";
        break;
      case "sent":
        badgeVariant = "outline";
        statusLabel = "Enviada";
        break;
      case "paid":
        badgeVariant = "default";
        statusLabel = "Pagada";
        break;
      case "overdue":
        badgeVariant = "destructive";
        statusLabel = "Vencida";
        break;
      case "cancelled":
        badgeVariant = "secondary";
        statusLabel = "Cancelada";
        break;
      default:
        badgeVariant = "outline";
        statusLabel = status;
    }

    return <Badge variant={badgeVariant}>{statusLabel}</Badge>;
  };

  const columns: Column<Invoice>[] = [
    {
      header: "Número",
      accessorKey: "invoiceNumber",
    },
    {
      header: "Cliente",
      accessorKey: "clientId",
      cell: (invoice) => getClientName(invoice.clientId),
    },
    {
      header: "Emisión",
      accessorKey: "issueDate",
      cell: (invoice) => formatDate(invoice.issueDate),
    },
    {
      header: "Vencimiento",
      accessorKey: "dueDate",
      cell: (invoice) => formatDate(invoice.dueDate),
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: (invoice) => getStatusBadge(invoice.status),
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: (invoice) => formatCurrency(invoice.total),
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (invoice) => (
        <div className="flex space-x-2">
          <Link href={`/invoices/${invoice.id}`}>
            <Button variant="outline" size="sm">
              Ver
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  // Handle row click to navigate to invoice detail
  const handleRowClick = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  // Filter invoices by status
  const filteredInvoices = invoices
    ? statusFilter === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === statusFilter)
    : [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Facturas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus facturas y pagos</p>
        </div>
        <Link href="/invoices/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Facturas</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="sent">Enviadas</SelectItem>
              <SelectItem value="paid">Pagadas</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoadingInvoices ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando facturas...</p>
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay facturas registradas</h3>
              <p className="text-gray-500 mt-1 mb-4">Comienza creando tu primera factura</p>
              <Link href="/invoices/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </Link>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No hay facturas con el estado seleccionado</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredInvoices}
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
