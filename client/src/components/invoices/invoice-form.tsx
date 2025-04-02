import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Client {
  id: number;
  companyName: string;
}

// Schema for invoice items
const invoiceItemSchema = z.object({
  description: z.string().min(1, { message: "La descripción es requerida" }),
  quantity: z.number().min(0.01, { message: "La cantidad debe ser mayor a 0" }),
  unitPrice: z.number().min(0.01, { message: "El precio debe ser mayor a 0" }),
  taxRate: z.number().min(0).max(100).default(0),
  amount: z.number(),
});

// Schema for the whole invoice
const invoiceFormSchema = z.object({
  clientId: z.number({
    required_error: "Por favor selecciona un cliente",
  }),
  invoiceNumber: z.string().min(1, { message: "El número de factura es requerido" }),
  issueDate: z.date({
    required_error: "La fecha de emisión es requerida",
  }),
  dueDate: z.date({
    required_error: "La fecha de vencimiento es requerida",
  }),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"], {
    required_error: "Por favor selecciona un estado",
  }),
  items: z.array(invoiceItemSchema).min(1, { message: "Debe agregar al menos un ítem" }),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormValues>;
  onSubmit: (data: InvoiceFormValues) => void;
  isSubmitting: boolean;
  clients: Client[];
}

export function InvoiceForm({ initialData, onSubmit, isSubmitting, clients }: InvoiceFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  // Default values for the form
  const defaultValues: Partial<InvoiceFormValues> = {
    clientId: initialData?.clientId || 0,
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    issueDate: initialData?.issueDate || new Date(),
    dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: initialData?.status || "draft",
    items: initialData?.items || [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        amount: 0,
      },
    ],
    subtotal: initialData?.subtotal || 0,
    taxAmount: initialData?.taxAmount || 0,
    total: initialData?.total || 0,
    notes: initialData?.notes || "",
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Function to generate a random invoice number (in a real app, this would be handled by the backend)
  function generateInvoiceNumber() {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().substr(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `INV-${year}${month}-${random}`;
  }

  // Function to calculate the amount for each item
  const calculateItemAmount = (quantity: number, unitPrice: number, taxRate: number) => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    return subtotal + taxAmount;
  };

  // Function to calculate invoice totals
  const calculateTotals = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const items = form.getValues("items");
      
      let subtotal = 0;
      let taxAmount = 0;
      
      // Recalculate amounts for each item
      items.forEach((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const taxRate = Number(item.taxRate) || 0;
        
        const itemSubtotal = quantity * unitPrice;
        const itemTaxAmount = itemSubtotal * (taxRate / 100);
        const amount = itemSubtotal + itemTaxAmount;
        
        // Update item amount
        form.setValue(`items.${index}.amount`, amount);
        
        // Add to totals
        subtotal += itemSubtotal;
        taxAmount += itemTaxAmount;
      });
      
      const total = subtotal + taxAmount;
      
      // Update form values
      form.setValue("subtotal", subtotal);
      form.setValue("taxAmount", taxAmount);
      form.setValue("total", total);
      
      setIsCalculating(false);
    }, 100);
  };

  // Recalculate totals when items change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes('items')) {
        calculateTotals();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Initial calculation
  useEffect(() => {
    calculateTotals();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Field */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select
                  disabled={isSubmitting}
                  value={field.value ? field.value.toString() : ""}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice Number Field */}
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Factura *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Issue Date Field */}
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Emisión *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          field.value.toLocaleDateString()
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date Field */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Vencimiento *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          field.value.toLocaleDateString()
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Field */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select
                  disabled={isSubmitting}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ítems de Factura</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                description: "",
                quantity: 1,
                unitPrice: 0,
                taxRate: 0,
                amount: 0,
              })}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar Ítem
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="divide-x divide-gray-200">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impuesto %
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((item, index) => (
                  <tr key={item.id} className="divide-x divide-gray-200">
                    <td className="px-4 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Descripción del ítem"
                                className="border-0 p-0 shadow-none focus-visible:ring-0"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                }}
                                className="border-0 p-0 shadow-none focus-visible:ring-0"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                }}
                                className="border-0 p-0 shadow-none focus-visible:ring-0"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                }}
                                className="border-0 p-0 shadow-none focus-visible:ring-0"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <div className="text-right font-medium">
                                {formatCurrency(field.value)}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1 || isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-medium">Subtotal:</td>
                  <td className="px-4 py-2 text-right font-medium">
                    <FormField
                      control={form.control}
                      name="subtotal"
                      render={({ field }) => (
                        <div>{formatCurrency(field.value)}</div>
                      )}
                    />
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-medium">Impuestos:</td>
                  <td className="px-4 py-2 text-right font-medium">
                    <FormField
                      control={form.control}
                      name="taxAmount"
                      render={({ field }) => (
                        <div>{formatCurrency(field.value)}</div>
                      )}
                    />
                  </td>
                  <td></td>
                </tr>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={4} className="px-4 py-2 text-right font-bold">Total:</td>
                  <td className="px-4 py-2 text-right font-bold">
                    <FormField
                      control={form.control}
                      name="total"
                      render={({ field }) => (
                        <div>{formatCurrency(field.value)}</div>
                      )}
                    />
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes Field */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Información adicional para el cliente (opcional)"
                  className="resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => form.reset(defaultValues)}>
            Cancelar
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting || isCalculating} onClick={calculateTotals}>
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              'Recalcular'
            )}
          </Button>
          <Button type="submit" disabled={isSubmitting || isCalculating}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Factura'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
