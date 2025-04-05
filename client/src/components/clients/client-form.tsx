import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, HelpCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

const clientFormSchema = z.object({
  clientType: z.enum(["company", "individual"], {
    required_error: "Debes seleccionar un tipo de cliente",
  }),
  // Campos para ambos tipos de clientes
  displayName: z.string().optional(),
  email: z.string().email({
    message: "Por favor ingresa un email válido",
  }).optional().or(z.literal("")),
  workPhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
  
  // Campos específicos para empresas
  companyName: z.string().min(2, {
    message: "El nombre de la empresa debe tener al menos 2 caracteres",
  }).optional(),
  
  // Campos para el contacto
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  initialData?: Partial<ClientFormValues>;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting: boolean;
}

export function ClientForm({ initialData, onSubmit, isSubmitting }: ClientFormProps) {
  const [clientType, setClientType] = useState<"company" | "individual">(initialData?.clientType || "company");
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientType: initialData?.clientType || "company",
      companyName: initialData?.companyName || "",
      displayName: initialData?.displayName || "",
      salutation: initialData?.salutation || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      workPhone: initialData?.workPhone || "",
      mobilePhone: initialData?.mobilePhone || "",
      address: initialData?.address || "",
      taxId: initialData?.taxId || "",
      notes: initialData?.notes || "",
    },
  });
  
  // Observa los cambios en el tipo de cliente para actualizar la UI
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "clientType") {
        setClientType(value.clientType as "company" | "individual");
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Tipo de cliente */}
        <FormField
          control={form.control}
          name="clientType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center">
                <FormLabel>Tipo de cliente</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[280px] text-sm">Selecciona el tipo de cliente. Empresarial para compañías o Individuo para personas naturales.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <label htmlFor="company" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Empresarial
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 ml-6">
                    <RadioGroupItem value="individual" id="individual" />
                    <label htmlFor="individual" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Individuo
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      
        {/* Contacto principal */}
        <div className="space-y-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">Contacto principal</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[280px] text-sm">Información de la persona de contacto principal.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salutation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Saludo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sr">Sr.</SelectItem>
                        <SelectItem value="sra">Sra.</SelectItem>
                        <SelectItem value="srta">Srta.</SelectItem>
                        <SelectItem value="dr">Dr.</SelectItem>
                        <SelectItem value="dra">Dra.</SelectItem>
                        <SelectItem value="lic">Lic.</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nombre de pila" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Apellido" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Campo específico de empresa si es tipo de cliente empresarial */}
        {clientType === "company" && (
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa el nombre de la empresa" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Nombre de visualización - como aparecerá en listados y reportes */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel className="text-rose-500">Nombre de visualización*</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[280px] text-sm">Este nombre se mostrará en todas las facturas y comunicaciones. Puedes usar el nombre de la empresa o un nombre personalizado.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o escriba para agregar" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientType === "company" && form.getValues("companyName") && (
                      <SelectItem value={form.getValues("companyName") || ""}>
                        {form.getValues("companyName")}
                      </SelectItem>
                    )}
                    {form.getValues("firstName") && form.getValues("lastName") && (
                      <SelectItem value={`${form.getValues("firstName") || ""} ${form.getValues("lastName") || ""}`}>
                        {`${form.getValues("firstName") || ""} ${form.getValues("lastName") || ""}`}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Dirección de correo electrónico */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>Dirección de correo electrónico</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[280px] text-sm">Correo para comunicaciones y facturas electrónicas.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <Input 
                  placeholder="ejemplo@correo.com" 
                  {...field} 
                  disabled={isSubmitting}
                  type="email"
                  className="pl-8" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Teléfonos */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Teléfono</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workPhone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="relative flex-grow">
                        <Input 
                          placeholder="Teléfono laboral" 
                          {...field} 
                          disabled={isSubmitting} 
                          className="pl-9" 
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <span className="text-gray-400">☎</span>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobilePhone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="relative flex-grow">
                        <Input 
                          placeholder="Móvil" 
                          {...field} 
                          disabled={isSubmitting} 
                          className="pl-9" 
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <span className="text-gray-400">📱</span>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Fiscal / RUC</FormLabel>
                <FormControl>
                  <Input placeholder="Identificación fiscal" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre el cliente"
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cliente'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
