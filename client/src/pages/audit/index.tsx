import { useState } from "react";
import { AuditLog } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";

export default function AuditLogsPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  // Construir la queryKey correctamente para gestionar la caché
  const queryKey = [
    '/api/audit-logs', 
    filterType ? { entityType: filterType } : undefined
  ].filter(Boolean);

  // Query para obtener los logs de auditoría
  const { data: logs, isLoading, error } = useQuery<AuditLog[]>({
    queryKey: queryKey,
    queryFn: async () => {
      let url = '/api/audit-logs';
      const params = new URLSearchParams();
      
      if (filterType) {
        params.append('entityType', filterType);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener logs de auditoría');
      }
      
      return response.json();
    },
  });

  // Formatear la fecha para mostrarla
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString()} - ${dateObj.toLocaleTimeString()}`;
  };

  // Obtener el tiempo relativo
  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  // Obtener color para el badge de acción
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'view':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Ver detalles del log
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  // Cambiar filtro por tipo de entidad
  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setFilterType(undefined);
    } else {
      setFilterType(value);
    }
  };

  return (
    <>
      <Helmet>
        <title>Registros de Auditoría | Efectivio</title>
      </Helmet>

      <div className="container py-8">
        <PageHeader>
          <PageHeaderHeading>Registros de Auditoría</PageHeaderHeading>
          <PageHeaderDescription>
            Visualiza todas las acciones realizadas en el sistema para mantener un control de cambios.
          </PageHeaderDescription>
        </PageHeader>
        <Separator className="my-6" />

        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            <div className="w-[200px]">
              <Select
                value={filterType || "all"}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="invoice">Facturas</SelectItem>
                  <SelectItem value="quote">Cotizaciones</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                  <SelectItem value="account">Cuentas</SelectItem>
                  <SelectItem value="journal">Asientos</SelectItem>
                  <SelectItem value="file">Archivos</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? (
            <div className="rounded-md bg-red-50 p-4 my-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al cargar los logs de auditoría
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error instanceof Error ? error.message : "Error desconocido"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>ID Entidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Mostrar esqueletos durante la carga
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={`cell-${i}-${j}`}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : logs && logs.length > 0 ? (
                    // Mostrar los logs
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.id}</TableCell>
                        <TableCell>{log.userId || 'Sistema'}</TableCell>
                        <TableCell>
                          <Badge
                            className={getActionColor(log.action)}
                            variant="outline"
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell>{log.entityId}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span title={formatDate(log.createdAt.toString())}>
                              {getRelativeTime(log.createdAt.toString())}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Mostrar mensaje cuando no hay datos
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No se encontraron registros de auditoría.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Diálogo para mostrar detalles */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalles del registro</DialogTitle>
              <DialogDescription>
                Registro de auditoría #{selectedLog?.id}
              </DialogDescription>
            </DialogHeader>
            
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                    <p>{selectedLog.userId || 'Sistema'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p>{formatDate(selectedLog.createdAt.toString())}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acción</p>
                    <Badge className={getActionColor(selectedLog.action)} variant="outline">
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entidad</p>
                    <p>{selectedLog.entityType} #{selectedLog.entityId}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Dirección IP</p>
                    <p>{selectedLog.ipAddress || 'No disponible'}</p>
                  </div>
                </div>
                
                {selectedLog.details && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Detalles</p>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      <pre className="text-xs">{JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)}</pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}