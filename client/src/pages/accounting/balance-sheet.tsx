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

interface BalanceSheetData {
  asOfDate: string;
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
}

interface AccountBalance {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
}

export default function BalanceSheetPage() {
  const { toast } = useToast();
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(new Date());

  // Fetch balance sheet data
  const { data, isLoading, error, refetch } = useQuery<BalanceSheetData>({
    queryKey: ['/api/reports/balance-sheet'],
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error al cargar balance",
        description: "No se pudo cargar el balance general. Intente de nuevo más tarde.",
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementation would typically generate a PDF or Excel
    toast({
      title: "Exportando balance",
      description: "El balance general se está descargando.",
    });
  };

  // Calculate totals
  const totalAssets = data?.assets.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalLiabilities = data?.liabilities.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalEquity = data?.equity.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Balance General</h1>
          <p className="text-gray-500 mt-1">Estado de situación financiera</p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !asOfDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {asOfDate ? asOfDate.toLocaleDateString() : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={asOfDate}
                onSelect={setAsOfDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
          <p className="text-lg font-semibold">BALANCE GENERAL</p>
          <p className="text-sm">
            Al {asOfDate?.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="pt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando balance general...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Error al cargar el balance</h3>
              <p className="text-gray-500 mt-1 mb-4">No se pudo generar el balance general</p>
              <Button onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Assets Section */}
              <div>
                <h3 className="text-lg font-bold mb-2">ACTIVOS</h3>
                <Table>
                  <TableBody>
                    {data?.assets.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.code} - {account.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-black">
                      <TableCell className="font-bold">TOTAL ACTIVOS</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalAssets)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Liabilities Section */}
              <div>
                <h3 className="text-lg font-bold mb-2">PASIVOS</h3>
                <Table>
                  <TableBody>
                    {data?.liabilities.map((account) => (
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
                      <TableCell className="font-bold">TOTAL PASIVOS</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalLiabilities)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Equity Section */}
              <div>
                <h3 className="text-lg font-bold mb-2">PATRIMONIO</h3>
                <Table>
                  <TableBody>
                    {data?.equity.map((account) => (
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
                      <TableCell className="font-bold">TOTAL PATRIMONIO</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalEquity)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Total Liabilities and Equity */}
              <div>
                <Table>
                  <TableBody>
                    <TableRow className="border-t-2 border-black">
                      <TableCell className="font-bold text-lg">TOTAL PASIVO + PATRIMONIO</TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatCurrency(totalLiabilitiesAndEquity)}
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
