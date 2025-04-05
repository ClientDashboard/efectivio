import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Settings2, Trash2 } from "lucide-react";

interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
}

// Esquema para agregar o editar configuraciones
const configSchema = z.object({
  key: z.string().min(1, "La clave es requerida"),
  value: z.string().min(1, "El valor es requerido"),
  description: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida")
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface SystemConfigTabProps {
  configs: SystemConfig[];
}

export default function SystemConfigTab({ configs }: SystemConfigTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [groupedConfigs, setGroupedConfigs] = React.useState<{[key: string]: SystemConfig[]}>({});
  
  // Agrupar configuraciones por categoría
  React.useEffect(() => {
    const grouped = configs.reduce<{[key: string]: SystemConfig[]}>((acc, config) => {
      const category = config.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(config);
      return acc;
    }, {});
    
    setGroupedConfigs(grouped);
  }, [configs]);
  
  // Formulario para agregar/editar configuraciones
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
      category: "general"
    }
  });
  
  // Mutación para crear configuración
  const createConfigMutation = useMutation({
    mutationFn: async (data: ConfigFormValues) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración creada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsAdding(false);
      form.reset();
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
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ConfigFormValues }) => {
      const res = await apiRequest("PUT", `/api/settings/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setEditingId(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar configuración
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/settings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración eliminada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Función para editar una configuración
  const handleEdit = (config: SystemConfig) => {
    form.reset({
      key: config.key,
      value: config.value,
      description: config.description,
      category: config.category || 'general'
    });
    setEditingId(config.id);
    setIsAdding(false);
  };
  
  // Función para eliminar una configuración
  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro de eliminar esta configuración?")) {
      deleteConfigMutation.mutate(id);
    }
  };
  
  // Función para cancelar la edición
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    form.reset();
  };
  
  // Función para enviar el formulario
  const onSubmit = (data: ConfigFormValues) => {
    if (editingId !== null) {
      updateConfigMutation.mutate({ id: editingId, data });
    } else {
      createConfigMutation.mutate(data);
    }
  };
  
  // Determinar si alguna mutación está en progreso
  const isSubmitting = createConfigMutation.isPending || updateConfigMutation.isPending || deleteConfigMutation.isPending;
  
  // Array de categorías únicas para el selector
  const uniqueCategories = Array.from(new Set(configs.map(c => c.category || 'general')));
  
  return (
    <div className="space-y-6">
      {/* Botón para agregar nueva configuración */}
      <div className="flex justify-end">
        <Button
          onClick={() => { setIsAdding(true); setEditingId(null); form.reset(); }}
          className="mb-4"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Configuración
        </Button>
      </div>
      
      {/* Formulario para agregar/editar configuración */}
      {(isAdding || editingId !== null) && (
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle>{editingId !== null ? "Editar Configuración" : "Nueva Configuración"}</CardTitle>
            <CardDescription>
              {editingId !== null 
                ? "Actualice los detalles de la configuración del sistema" 
                : "Configure un nuevo parámetro para el sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clave</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ejemplo: app.title" />
                        </FormControl>
                        <FormDescription>
                          Identificador único para esta configuración
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Valor de la configuración" />
                        </FormControl>
                        <FormDescription>
                          Valor actual para esta configuración
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="invoices">Facturas</SelectItem>
                          <SelectItem value="quotes">Cotizaciones</SelectItem>
                          <SelectItem value="clients">Clientes</SelectItem>
                          <SelectItem value="security">Seguridad</SelectItem>
                          <SelectItem value="notifications">Notificaciones</SelectItem>
                          <SelectItem value="integration">Integraciones</SelectItem>
                          <SelectItem value="appearance">Apariencia</SelectItem>
                          {/* Agregar otras categorías del array de categorías únicas que no estén ya en la lista */}
                          {uniqueCategories.filter(c => 
                            !['general', 'email', 'invoices', 'quotes', 'clients', 'security', 'notifications', 'integration', 'appearance'].includes(c)
                          ).map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Agrupa las configuraciones para una mejor organización
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describa el propósito de esta configuración"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId !== null ? "Actualizar" : "Guardar"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Listado de configuraciones agrupadas por categoría */}
      {Object.keys(groupedConfigs).length > 0 ? (
        Object.entries(groupedConfigs).map(([category, configs]) => (
          <Card key={category} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings2 className="mr-2 h-5 w-5" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </CardTitle>
              <CardDescription>
                Configuraciones relacionadas con {category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configs.map((config) => (
                  <div 
                    key={config.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{config.key}</div>
                      <div className="text-sm opacity-90">{config.value}</div>
                      {config.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 self-end sm:self-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(config)}
                        disabled={isSubmitting}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(config.id)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin configuraciones</CardTitle>
            <CardDescription>
              No hay configuraciones del sistema registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              Haga clic en "Nueva Configuración" para agregar parámetros al sistema
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}