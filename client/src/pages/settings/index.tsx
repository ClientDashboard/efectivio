import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import SystemConfigTab from "@/components/settings/system-config-tab";
import WhiteLabelTab from "@/components/settings/white-label-tab";
import { PageHeader } from '@/components/layout/page-header';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, Settings2, Palette } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("system");
  
  // Cargar configuraciones del sistema
  const { 
    data: systemConfigs,
    isLoading: isLoadingConfigs,
    error: configsError
  } = useQuery({
    queryKey: ["/api/settings"],
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones del sistema",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Cargar configuración white label activa
  const { 
    data: activeWhiteLabel,
    isLoading: isLoadingActiveWhiteLabel,
    error: activeWhiteLabelError
  } = useQuery({
    queryKey: ["/api/white-label/active"],
    onError: (error) => {
      // No mostramos error porque es normal que no haya configuración activa
      console.log("No hay configuración de white label activa:", error);
    }
  });
  
  // Cargar todas las configuraciones white label
  const { 
    data: allWhiteLabels,
    isLoading: isLoadingAllWhiteLabels,
    error: allWhiteLabelsError
  } = useQuery({
    queryKey: ["/api/white-label"],
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de marca blanca",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Estado de carga
  const isLoading = isLoadingConfigs || isLoadingActiveWhiteLabel || isLoadingAllWhiteLabels;
  
  // Si hay un error, mostrar mensaje
  if (configsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            No se pudieron cargar las configuraciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">
            {error?.toString()}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Si está cargando, mostrar loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Configuración general del sistema y personalización de marca"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Configuración del Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Personalización</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="mt-0">
          <SystemConfigTab configs={systemConfigs || []} />
        </TabsContent>
        
        <TabsContent value="branding" className="mt-0">
          <WhiteLabelTab 
            activeConfig={activeWhiteLabel || null}
            allConfigs={allWhiteLabels || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}