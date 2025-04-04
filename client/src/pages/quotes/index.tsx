import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, FileText, Eye, ArrowRightCircle, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Quote {
  id: number;
  quoteNumber: string;
  clientId: number;
  issueDate: string;
  expiryDate: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  subtotal: string;
  taxAmount: string;
  total: string;
  convertedToInvoiceId?: number;
}

interface Client {
  id: number;
  companyName: string;
}

export default function QuotesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    refetchOnWindowFocus: false,
  });

  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    refetchOnWindowFocus: false,
  });

  const getClientName = (clientId: number) => {
    if (!clients) return 'Cliente no encontrado';
    const client = clients.find((c: Client) => c.id === clientId);
    return client ? client.companyName : 'Cliente no encontrado';
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Borrador', color: 'bg-gray-200 text-gray-800' };
      case 'sent':
        return { label: 'Enviada', color: 'bg-blue-100 text-blue-800' };
      case 'accepted':
        return { label: 'Aceptada', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: 'Rechazada', color: 'bg-red-100 text-red-800' };
      case 'expired':
        return { label: 'Vencida', color: 'bg-amber-100 text-amber-800' };
      case 'converted':
        return { label: 'Convertida', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: status, color: 'bg-gray-200 text-gray-800' };
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMM yyyy', { locale: es });
  };

  const handleRowClick = (quote: Quote) => {
    navigate(`/quotes/${quote.id}`);
  };

  const filteredQuotes = searchQuery && quotes
    ? quotes.filter((quote: Quote) => 
        quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getClientName(quote.clientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatCurrency(quote.total).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quotes;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestiona las cotizaciones y propuestas para tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/quotes/create">
            <Plus className="mr-2 h-4 w-4" /> Nueva cotización
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Listado de cotizaciones</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar cotización..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            {quotes && quotes.length > 0
              ? `${filteredQuotes?.length || 0} cotizaciones encontradas`
              : "No hay cotizaciones registradas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingQuotes || isLoadingClients ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes && filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote: Quote) => (
                    <TableRow 
                      key={quote.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(quote)}
                    >
                      <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                      <TableCell>{getClientName(quote.clientId)}</TableCell>
                      <TableCell>{formatDate(quote.issueDate)}</TableCell>
                      <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${formatStatus(quote.status).color} hover:${formatStatus(quote.status).color}`}
                        >
                          {formatStatus(quote.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(quote.total)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quotes/${quote.id}`);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver cotización</span>
                            </DropdownMenuItem>
                            {quote.status !== 'converted' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/quotes/${quote.id}/edit`);
                              }}>
                                <ArrowRightCircle className="mr-2 h-4 w-4" />
                                <span>Convertir a factura</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron cotizaciones.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}