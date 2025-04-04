import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import DataTable, { Column } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, LayoutList } from "lucide-react";
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

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  parentId: number | null;
  isActive: boolean;
}

export default function ChartOfAccountsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar plan de cuentas",
        description: "No se pudieron cargar las cuentas contables. Intente de nuevo más tarde.",
      });
    }
  });

  // Get account type label
  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      asset: "Activo",
      liability: "Pasivo",
      equity: "Patrimonio",
      revenue: "Ingreso",
      expense: "Gasto"
    };
    
    return types[type] || type;
  };

  // Account type badge styling
  const getAccountTypeBadge = (type: string) => {
    const label = getAccountTypeLabel(type);
    let badgeVariant: "default" | "outline" | "secondary" = "default";

    switch (type) {
      case "asset":
        badgeVariant = "default";
        break;
      case "liability":
      case "equity":
        badgeVariant = "secondary";
        break;
      case "revenue":
      case "expense":
        badgeVariant = "outline";
        break;
      default:
        badgeVariant = "default";
    }

    return <Badge variant={badgeVariant}>{label}</Badge>;
  };

  const columns: Column<Account>[] = [
    {
      header: "Código",
      accessorKey: "code",
    },
    {
      header: "Nombre",
      accessorKey: "name",
    },
    {
      header: "Tipo",
      accessorKey: "type",
      cell: (account) => getAccountTypeBadge(account.type),
    },
    {
      header: "Descripción",
      accessorKey: "description",
      cell: (account) => account.description || "—",
    },
    {
      header: "Estado",
      accessorKey: "isActive",
      cell: (account) => (
        <Badge variant={account.isActive ? "default" : "secondary"}>
          {account.isActive ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (account) => (
        <div className="flex space-x-2">
          <Link href={`/accounting/chart-of-accounts/${account.id}`}>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  // Handle row click to navigate to account detail
  const handleRowClick = (account: Account) => {
    navigate(`/accounting/chart-of-accounts/${account.id}`);
  };

  // Filter accounts by type
  const filteredAccounts = accounts
    ? typeFilter === "all"
      ? accounts
      : accounts.filter((account) => account.type === typeFilter)
    : [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Plan de Cuentas</h1>
          <p className="text-gray-500 mt-1">Gestiona el catálogo de cuentas contables</p>
        </div>
        <Link href="/accounting/chart-of-accounts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Catálogo de Cuentas</CardTitle>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="asset">Activos</SelectItem>
              <SelectItem value="liability">Pasivos</SelectItem>
              <SelectItem value="equity">Patrimonio</SelectItem>
              <SelectItem value="revenue">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando plan de cuentas...</p>
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <LayoutList className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay cuentas registradas</h3>
              <p className="text-gray-500 mt-1 mb-4">Comienza creando tu plan de cuentas</p>
              <Link href="/accounting/chart-of-accounts/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cuenta
                </Button>
              </Link>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No hay cuentas del tipo seleccionado</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAccounts}
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
