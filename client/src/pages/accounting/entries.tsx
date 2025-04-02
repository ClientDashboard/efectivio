import { useState } from "react";
import { Link, useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import DataTable, { Column } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface JournalEntry {
  id: number;
  date: string;
  reference: string | null;
  description: string;
  sourceType: string | null;
  sourceId: number | null;
  createdAt: string;
}

export default function EntriesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar asientos",
        description: "No se pudieron cargar los asientos contables. Intente de nuevo más tarde.",
      });
    }
  });

  // Get source type label
  const getSourceTypeLabel = (sourceType: string | null) => {
    if (!sourceType) return "Manual";
    
    const types: Record<string, string> = {
      invoice: "Factura",
      expense: "Gasto",
      manual: "Manual"
    };
    
    return types[sourceType] || sourceType;
  };

  const columns: Column<JournalEntry>[] = [
    {
      header: "Fecha",
      accessorKey: "date",
      cell: (entry) => formatDate(entry.date),
    },
    {
      header: "Referencia",
      accessorKey: "reference",
      cell: (entry) => entry.reference || "—",
    },
    {
      header: "Descripción",
      accessorKey: "description",
    },
    {
      header: "Origen",
      accessorKey: "sourceType",
      cell: (entry) => getSourceTypeLabel(entry.sourceType),
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (entry) => (
        <div className="flex space-x-2">
          <Link href={`/accounting/entries/${entry.id}`}>
            <Button variant="outline" size="sm">
              Ver Detalle
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  // Handle row click to navigate to entry detail
  const handleRowClick = (entry: JournalEntry) => {
    navigate(`/accounting/entries/${entry.id}`);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Asientos Contables</h1>
          <p className="text-gray-500 mt-1">Gestiona los asientos del libro diario</p>
        </div>
        <Link href="/accounting/entries/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Asiento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Libro Diario</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando asientos contables...</p>
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay asientos contables registrados</h3>
              <p className="text-gray-500 mt-1 mb-4">Comienza creando tu primer asiento</p>
              <Link href="/accounting/entries/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Asiento
                </Button>
              </Link>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={entries}
              onRowClick={handleRowClick}
              keyField="id"
              searchable={true}
            />
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
