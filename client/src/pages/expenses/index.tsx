import { useState } from "react";
import { Link, useLocation } from "wouter";
import DataTable, { Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Plus, Receipt } from "lucide-react";
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

interface Expense {
  id: number;
  description: string;
  date: string;
  amount: string;
  category: string;
  notes: string | null;
  receipt: string | null;
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar gastos",
        description: "No se pudieron cargar los gastos. Intente de nuevo más tarde.",
      });
    }
  });

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      office: "Oficina",
      travel: "Viajes",
      marketing: "Marketing",
      utilities: "Servicios",
      rent: "Alquiler",
      salary: "Salarios",
      equipment: "Equipos",
      supplies: "Suministros",
      taxes: "Impuestos",
      other: "Otros"
    };
    
    return categories[category] || category;
  };

  // Category badge styling
  const getCategoryBadge = (category: string) => {
    const label = getCategoryLabel(category);
    let badgeVariant: "default" | "outline" | "secondary" = "outline";

    switch (category) {
      case "utilities":
      case "rent":
      case "taxes":
        badgeVariant = "secondary";
        break;
      case "salary":
      case "equipment":
        badgeVariant = "default";
        break;
      default:
        badgeVariant = "outline";
    }

    return <Badge variant={badgeVariant}>{label}</Badge>;
  };

  const columns: Column<Expense>[] = [
    {
      header: "Descripción",
      accessorKey: "description",
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: (expense) => formatDate(expense.date),
    },
    {
      header: "Categoría",
      accessorKey: "category",
      cell: (expense) => getCategoryBadge(expense.category),
    },
    {
      header: "Monto",
      accessorKey: "amount",
      cell: (expense) => formatCurrency(expense.amount),
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (expense) => (
        <div className="flex space-x-2">
          <Link href={`/expenses/${expense.id}`}>
            <Button variant="outline" size="sm">
              Ver
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  // Handle row click to navigate to expense detail
  const handleRowClick = (expense: Expense) => {
    navigate(`/expenses/${expense.id}`);
  };

  // Filter expenses by category
  const filteredExpenses = expenses
    ? categoryFilter === "all"
      ? expenses
      : expenses.filter((expense) => expense.category === categoryFilter)
    : [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gastos</h1>
          <p className="text-gray-500 mt-1">Gestiona y categoriza tus gastos</p>
        </div>
        <Link href="/expenses/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Gastos</CardTitle>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="office">Oficina</SelectItem>
              <SelectItem value="travel">Viajes</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="utilities">Servicios</SelectItem>
              <SelectItem value="rent">Alquiler</SelectItem>
              <SelectItem value="salary">Salarios</SelectItem>
              <SelectItem value="equipment">Equipos</SelectItem>
              <SelectItem value="supplies">Suministros</SelectItem>
              <SelectItem value="taxes">Impuestos</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando gastos...</p>
            </div>
          ) : !expenses || expenses.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay gastos registrados</h3>
              <p className="text-gray-500 mt-1 mb-4">Comienza registrando tu primer gasto</p>
              <Link href="/expenses/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </Link>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No hay gastos en la categoría seleccionada</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredExpenses}
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
