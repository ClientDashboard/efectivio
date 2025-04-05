import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ColorPicker } from "@/components/color-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  BadgeCheck, 
  CircleX, 
  Globe, 
  ImagePlus, 
  Loader2, 
  PaintBucket,
  Palette, 
  Trash2, 
  Upload 
} from "lucide-react";

// Esquema para validar configuración de marca blanca
const whiteLabelSchema = z.object({
  id: z.number().optional(),
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  domain: z.string().min(1, "El dominio es requerido"),
  primaryColor: z.string().min(1, "El color primario es requerido"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  footerText: z.string().optional(),
  enablePoweredBy: z.boolean().default(true),
  isActive: z.boolean().default(false),
  clientId: z.number().nullable().optional(),
  contactEmail: z.string().email("Debe ser un email válido").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  additionalCss: z.string().optional(),
});

type WhiteLabelFormValues = z.infer<typeof whiteLabelSchema>;

interface WhiteLabelConfig {
  id: number;
  companyName: string;
  domain: string;
  primaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  enablePoweredBy: boolean;
  isActive: boolean;
  clientId?: number | null;
  contactEmail?: string;
  contactPhone?: string;
  additionalCss?: string;
  createdAt: string;
  updatedAt: string;
}

interface WhiteLabelTabProps {
  activeConfig: WhiteLabelConfig | null;
  allConfigs: WhiteLabelConfig[];
}

export default function WhiteLabelTab({ activeConfig, allConfigs }: WhiteLabelTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConfigId, setSelectedConfigId] = React.useState<number | null>(
    activeConfig ? activeConfig.id : null
  );
  const [isCreating, setIsCreating] = React.useState(false);
  
  // Formulario para añadir/editar configuración de marca blanca
  const form = useForm<WhiteLabelFormValues>({
    resolver: zodResolver(whiteLabelSchema),
    defaultValues: {
      companyName: "",
      domain: "",
      primaryColor: "#3B82F6",
      logoUrl: "",
      faviconUrl: "",
      footerText: "",
      enablePoweredBy: true,
      isActive: false,
      clientId: null,
      contactEmail: "",
      contactPhone: "",
      additionalCss: "",
    }
  });
  
  // Actualizar formulario cuando cambia la configuración seleccionada
  React.useEffect(() => {
    if (selectedConfigId) {
      const config = allConfigs.find(c => c.id === selectedConfigId);
      if (config) {
        form.reset({
          id: config.id,
          companyName: config.companyName,
          domain: config.domain,
          primaryColor: config.primaryColor,
          logoUrl: config.logoUrl || "",
          faviconUrl: config.faviconUrl || "",
          footerText: config.footerText || "",
          enablePoweredBy: config.enablePoweredBy,
          isActive: config.isActive,
          clientId: config.clientId || null,
          contactEmail: config.contactEmail || "",
          contactPhone: config.contactPhone || "",
          additionalCss: config.additionalCss || "",
        });
        setIsCreating(false);
      }
    } else if (isCreating) {
      form.reset({
        companyName: "",
        domain: "",
        primaryColor: "#3B82F6",
        logoUrl: "",
        faviconUrl: "",
        footerText: "",
        enablePoweredBy: true,
        isActive: false,
        clientId: null,
        contactEmail: "",
        contactPhone: "",
        additionalCss: "",
      });
    }
  }, [selectedConfigId, allConfigs, isCreating, form]);
  
  // Mutación para crear configuración
  const createWhiteLabelMutation = useMutation({
    mutationFn: async (data: WhiteLabelFormValues) => {
      const res = await apiRequest("POST", "/api/white-label", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración de marca blanca creada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label/active"] });
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para actualizar configuración
  const updateWhiteLabelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: WhiteLabelFormValues }) => {
      const res = await apiRequest("PUT", `/api/white-label/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración de marca blanca actualizada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label/active"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para activar configuración
  const activateWhiteLabelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/white-label/${id}/activate`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración de marca blanca activada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label/active"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo activar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para desactivar todas las configuraciones
  const deactivateAllWhiteLabelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/white-label/deactivate-all`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Todas las configuraciones de marca blanca han sido desactivadas",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label/active"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudieron desactivar las configuraciones: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar configuración
  const deleteWhiteLabelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/white-label/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración de marca blanca eliminada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      queryClient.invalidateQueries({ queryKey: ["/api/white-label/active"] });
      setSelectedConfigId(null);
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Función para enviar el formulario
  const onSubmit = (data: WhiteLabelFormValues) => {
    if (isCreating) {
      createWhiteLabelMutation.mutate(data);
    } else if (selectedConfigId) {
      updateWhiteLabelMutation.mutate({ id: selectedConfigId, data });
    }
  };
  
  // Función para eliminar configuración
  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro de eliminar esta configuración de marca blanca?")) {
      deleteWhiteLabelMutation.mutate(id);
    }
  };
  
  // Función para activar configuración
  const handleActivate = (id: number) => {
    activateWhiteLabelMutation.mutate(id);
  };
  
  // Función para desactivar todas las configuraciones
  const handleDeactivateAll = () => {
    if (window.confirm("¿Está seguro de desactivar todas las configuraciones de marca blanca?")) {
      deactivateAllWhiteLabelMutation.mutate();
    }
  };
  
  // Determinar si alguna mutación está en progreso
  const isSubmitting = 
    createWhiteLabelMutation.isPending || 
    updateWhiteLabelMutation.isPending || 
    activateWhiteLabelMutation.isPending ||
    deactivateAllWhiteLabelMutation.isPending ||
    deleteWhiteLabelMutation.isPending;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Panel izquierdo - Lista de configuraciones */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configuraciones</span>
                <Button 
                  size="sm" 
                  onClick={() => { 
                    setSelectedConfigId(null);
                    setIsCreating(true);
                  }}
                  disabled={isSubmitting}
                >
                  Crear Nuevo
                </Button>
              </CardTitle>
              <CardDescription>
                Gestione sus configuraciones de marca blanca
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allConfigs.length > 0 ? (
                <div className="space-y-2">
                  {allConfigs.map((config) => (
                    <div
                      key={config.id}
                      className={`p-3 rounded-md cursor-pointer border-2 flex items-center justify-between ${
                        selectedConfigId === config.id ? 'border-primary' : 'border-border'
                      } ${config.isActive ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        setSelectedConfigId(config.id);
                        setIsCreating(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: config.primaryColor }}
                        />
                        <div>
                          <div className="font-medium">{config.companyName}</div>
                          <div className="text-xs text-muted-foreground">{config.domain}</div>
                        </div>
                      </div>
                      {config.isActive && (
                        <BadgeCheck className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay configuraciones de marca blanca. Cree una nueva.
                </div>
              )}
            </CardContent>
            {activeConfig && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleDeactivateAll}
                  disabled={isSubmitting}
                >
                  <CircleX className="h-4 w-4 mr-2" />
                  Desactivar todas
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {/* Panel derecho - Formulario */}
        <div className="w-full md:w-2/3">
          {(selectedConfigId || isCreating) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  {isCreating 
                    ? "Nueva Configuración de Marca Blanca" 
                    : "Editar Configuración de Marca Blanca"}
                </CardTitle>
                <CardDescription>
                  {isCreating 
                    ? "Configure una nueva personalización de marca" 
                    : "Actualice los detalles de la personalización de marca"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Información Básica</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de la Empresa</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Mi Empresa" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="domain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dominio</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2 opacity-70" />
                                  <Input {...field} placeholder="empresa.dominio.com" />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Dominio principal para esta marca
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email de Contacto</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="contacto@empresa.com" 
                                  type="email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono de Contacto</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+1234567890" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-medium">Apariencia</h3>
                      
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color Principal</FormLabel>
                            <FormControl>
                              <ColorPicker
                                color={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Este color se utilizará para elementos principales en la interfaz
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL del Logo</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} placeholder="https://miempresa.com/logo.png" />
                                  <Button type="button" variant="outline" size="icon">
                                    <ImagePlus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Logo principal para el sitio
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="faviconUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL del Favicon</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} placeholder="https://miempresa.com/favicon.ico" />
                                  <Button type="button" variant="outline" size="icon">
                                    <ImagePlus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Icono para la pestaña del navegador
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="footerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto del Pie de Página</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="© 2025 Mi Empresa. Todos los derechos reservados."
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalCss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CSS Personalizado</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder=".custom-class { color: #333; }"
                                rows={4}
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormDescription>
                              CSS adicional para personalizar la apariencia
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enablePoweredBy"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Mostrar "Powered by Efectivio"
                              </FormLabel>
                              <FormDescription>
                                Muestra un pequeño texto "Powered by Efectivio" en el pie de página
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {!isCreating && (
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Configuración Activa
                                </FormLabel>
                                <FormDescription>
                                  Determina si esta configuración está activa actualmente
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={true} 
                                  // Deshabilitamos porque se activa con el botón específico
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      {selectedConfigId && !isCreating && (
                        <>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleDelete(selectedConfigId)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                          
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleActivate(selectedConfigId)}
                            disabled={isSubmitting || form.getValues().isActive}
                          >
                            <BadgeCheck className="h-4 w-4 mr-2" />
                            Activar
                          </Button>
                        </>
                      )}
                      
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isCreating ? "Crear" : "Actualizar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Personalización de Marca</CardTitle>
                <CardDescription>
                  Seleccione una configuración existente o cree una nueva
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <Palette className="h-16 w-16 text-primary/30" />
                <p className="text-center text-muted-foreground">
                  Haga clic en una configuración de la lista o cree una nueva para comenzar
                </p>
                <Button 
                  onClick={() => { 
                    setSelectedConfigId(null);
                    setIsCreating(true);
                  }}
                >
                  Crear Nueva Configuración
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}