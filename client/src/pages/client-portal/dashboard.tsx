import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client } from '@shared/schema';
import { Loader2, FileText, Receipt, Clock, Calendar } from 'lucide-react';

export default function ClientPortalDashboard() {
  const { clientId } = useParams();
  const id = parseInt(clientId || '0');

  // Obtener información del cliente
  const { data: client, isLoading } = useQuery<Client>({
    queryKey: [`/api/clients/${id}`],
    enabled: !!id && id > 0,
  });

  const [activeTab, setActiveTab] = useState('resumen');

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center p-8 border border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">Cliente no encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No se pudo encontrar la información de este cliente o no tiene acceso al portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6">
      <Helmet>
        <title>Dashboard del Cliente | {client.displayName || client.companyName}</title>
      </Helmet>

      <div className="flex justify-between items-start mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido, {client.displayName || client.companyName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte su información financiera y documentos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="cotizaciones">Cotizaciones</TabsTrigger>
          <TabsTrigger value="archivos">Archivos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">0</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cotizaciones Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">0</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Documentos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">0</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                No hay actividad reciente
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                No hay facturas disponibles
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cotizaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                No hay cotizaciones disponibles
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archivos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archivos Compartidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                No hay archivos compartidos
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}