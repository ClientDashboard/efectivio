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
import { Loader2, HelpCircle, AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.enum(["immediate", "15_days", "30_days", "45_days", "60_days", "custom"]).default("30_days"),
  customPaymentTerms: z.string().optional(),
  hasPortalAccess: z.boolean().default(false),
  sendPortalInvitation: z.boolean().default(false),
  notes: z.string().optional(),
  
  // Campos específicos para empresas
  companyName: z.string().optional(),
  
  // Campos para el contacto
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(
  (data) => {
    // Si es una empresa, el nombre de la empresa es obligatorio
    if (data.clientType === "company") {
      return !!data.companyName && data.companyName.length >= 2;
    }
    // Si es un individuo, el nombre es obligatorio
    return !!data.firstName && data.firstName.length >= 2;
  },
  {
    message: data => data.clientType === "company" 
      ? "El nombre de la empresa es obligatorio (mínimo 2 caracteres)" 
      : "El nombre es obligatorio (mínimo 2 caracteres)",
    path: data => data.clientType === "company" ? ["companyName"] : ["firstName"]
  }
);

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
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "",
      taxId: initialData?.taxId || "",
      paymentTerms: initialData?.paymentTerms || "30_days",
      customPaymentTerms: initialData?.customPaymentTerms || "",
      hasPortalAccess: initialData?.hasPortalAccess || false,
      sendPortalInvitation: false, // Esto siempre inicia como falso
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
        
        {/* Información fiscal */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Información fiscal</h3>
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
        </div>

        {/* Dirección */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Dirección</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calle y número</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle y número" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ciudad" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado/Provincia</FormLabel>
                  <FormControl>
                    <Input placeholder="Estado o provincia" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código postal</FormLabel>
                  <FormControl>
                    <Input placeholder="Código postal" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="País" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Términos de pago */}
        <div className="space-y-4">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">Términos de pago</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[280px] text-sm">Términos de pago por defecto para este cliente. Se aplicarán automáticamente al crear facturas.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <label htmlFor="immediate" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Al contado
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="15_days" id="15_days" />
                      <label htmlFor="15_days" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        15 días
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30_days" id="30_days" />
                      <label htmlFor="30_days" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        30 días
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="45_days" id="45_days" />
                      <label htmlFor="45_days" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        45 días
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="60_days" id="60_days" />
                      <label htmlFor="60_days" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        60 días
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <label htmlFor="custom" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Personalizado
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.watch("paymentTerms") === "custom" && (
            <FormField
              control={form.control}
              name="customPaymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Términos de pago personalizados</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 50% adelanto, 50% contra entrega" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Portal de cliente */}
        <div className="space-y-4">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">Portal de cliente</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[280px] text-sm">Habilita el acceso al portal para que el cliente pueda ver sus facturas, cotizaciones y documentos.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="hasPortalAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Habilitar portal de cliente</FormLabel>
                    <FormDescription>
                      El cliente podrá acceder a sus documentos, facturas y cotizaciones.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("hasPortalAccess") && form.watch("email") && (
              <FormField
                control={form.control}
                name="sendPortalInvitation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting || !form.watch("email")}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enviar invitación por correo</FormLabel>
                      <FormDescription>
                        Se enviará un correo a <strong>{form.watch("email")}</strong> con un link para registrarse en el portal.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
            
            {form.watch("hasPortalAccess") && !form.watch("email") && (
              <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Correo electrónico requerido</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Para habilitar el portal de cliente, es necesario proporcionar una dirección de correo electrónico.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
