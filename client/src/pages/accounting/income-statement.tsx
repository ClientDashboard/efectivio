import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText, Download, Printer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface IncomeStatementData {
  startDate: string;
  endDate: string;
  revenue: AccountBalance[];
  expenses: AccountBalance[];
}

interface AccountBalance {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
}

export default function IncomeStatementPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  // Fetch income statement data
  const { data, isLoading, error, refetch } = useQuery<IncomeStatementData>({
    queryKey: ['/api/reports/income-statement'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar estado de resultados",
        description: "No se pudo cargar el estado de resultados. Intente de nuevo más tarde.",
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "Exportando informe",
      description: "El estado de resultados se está descargando.",
    });
  };

  // Calculate totals
  const totalRevenue = data?.revenue.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalExpenses = data?.expenses.reduce((sum, account) => sum + account.balance, 0) || 0;
  const netIncome = totalRevenue - totalExpenses;

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Estado de Resultados</h1>
          <p className="text-gray-500 mt-1">Ingresos y egresos del período</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    "Seleccionar período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card id="printable-content" className="p-4">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-xl font-bold">EFECTIVIO S.A.</CardTitle>
          <p className="text-lg font-semibold">ESTADO DE RESULTADOS</p>
          <p className="text-sm">
            Del {dateRange.from?.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} al {dateRange.to?.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="pt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando estado de resultados...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Error al cargar el informe</h3>
              <p className="text-gray-500 mt-1 mb-4">No se pudo generar el estado de resultados</p>
              <Button onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Revenue Section */}
              <div>
                <h3 className="text-lg font-bold mb-2">INGRESOS</h3>
                <Table>
                  <TableBody>
                    {data?.revenue.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.code} - {account.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL INGRESOS</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalRevenue)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Expenses Section */}
              <div>
                <h3 className="text-lg font-bold mb-2">GASTOS</h3>
                <Table>
                  <TableBody>
                    {data?.expenses.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.code} - {account.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL GASTOS</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalExpenses)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Net Income */}
              <div>
                <Table>
                  <TableBody>
                    <TableRow className="border-t-2 border-black">
                      <TableCell className="font-bold text-lg">UTILIDAD / PÉRDIDA NETA</TableCell>
                      <TableCell className={cn(
                        "text-right font-bold text-lg",
                        netIncome >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(netIncome)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t pt-6 mt-8">
          <p className="text-xs text-gray-500">
            Este informe fue generado a partir de los datos contables registrados en el sistema Efectivio.
          </p>
          <p className="text-xs text-gray-500">
            Fecha de generación: {new Date().toLocaleString()}
          </p>
        </CardFooter>
      </Card>
    </MainLayout>
  );
}
