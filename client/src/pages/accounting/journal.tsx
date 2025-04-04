import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: number;
  date: string;
  reference: string | null;
  description: string;
  lines: JournalLine[];
}

interface JournalLine {
  id: number;
  journalEntryId: number;
  accountId: number;
  accountName?: string;
  description: string | null;
  debit: string;
  credit: string;
}

interface Account {
  id: number;
  code: string;
  name: string;
}

export default function JournalPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Fetch journal entries
  const { data: entries, isLoading: isLoadingEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar asientos",
        description: "No se pudieron cargar los asientos contables. Intente de nuevo más tarde.",
      });
    }
  });

  // Fetch accounts for display
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    onError: (err) => {
      console.error("Error loading accounts:", err);
    }
  });

  // Get account name by id
  const getAccountName = (accountId: number) => {
    const account = accounts?.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : `Cuenta #${accountId}`;
  };

  // Filter entries by date
  const filteredEntries = entries
    ? entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (!startDate || entryDate >= startDate) && 
               (!endDate || entryDate <= endDate);
      })
    : [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Libro Diario</h1>
          <p className="text-gray-500 mt-1">Visualiza los asientos contables en orden cronológico</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDate(startDate) : "Fecha inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span>a</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? formatDate(endDate) : "Fecha final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos del Libro Diario</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEntries ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando asientos contables...</p>
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay asientos contables registrados</h3>
              <p className="text-gray-500 mt-1 mb-4">Los asientos se generan automáticamente al crear facturas y gastos</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No hay asientos contables en el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="mb-6 bg-white rounded-xl p-4 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {formatDate(entry.date)} | Ref: {entry.reference || "N/A"}
                      </p>
                      <h3 className="text-base font-medium">{entry.description}</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/accounting/entries/${entry.id}`)}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cuenta</TableHead>
                          <TableHead>Detalle</TableHead>
                          <TableHead className="text-right">Debe</TableHead>
                          <TableHead className="text-right">Haber</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entry.lines?.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>{getAccountName(line.accountId)}</TableCell>
                            <TableCell>{line.description || "—"}</TableCell>
                            <TableCell className="text-right">
                              {parseFloat(line.debit) > 0 ? formatCurrency(line.debit) : ""}
                            </TableCell>
                            <TableCell className="text-right">
                              {parseFloat(line.credit) > 0 ? formatCurrency(line.credit) : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
