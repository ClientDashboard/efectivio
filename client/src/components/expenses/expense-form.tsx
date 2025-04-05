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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const expenseFormSchema = z.object({
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres",
  }),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  amount: z.number({
    required_error: "El monto es requerido",
    invalid_type_error: "El monto debe ser un número",
  }).min(0.01, {
    message: "El monto debe ser mayor a 0",
  }),
  category: z.enum([
    "office", "travel", "marketing", "utilities", 
    "rent", "salary", "equipment", "supplies", 
    "taxes", "other"
  ], {
    required_error: "Por favor selecciona una categoría",
  }),
  notes: z.string().optional(),
  receipt: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormValues>;
  onSubmit: (data: ExpenseFormValues) => void;
  isSubmitting: boolean;
}

export function ExpenseForm({ initialData, onSubmit, isSubmitting }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: initialData?.description || "",
      date: initialData?.date || new Date(),
      amount: initialData?.amount || 0,
      category: initialData?.category || "other",
      notes: initialData?.notes || "",
      receipt: initialData?.receipt || "",
    },
  });

  // Map of categories to display names
  const categoryDisplayNames = {
    office: "Oficina",
    travel: "Viajes",
    marketing: "Marketing",
    utilities: "Servicios",
    rent: "Alquiler",
    salary: "Salarios",
    equipment: "Equipos",
    supplies: "Suministros",
    taxes: "Impuestos",
    other: "Otros",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción *</FormLabel>
                <FormControl>
                  <Input placeholder="Describe el gasto" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha *</FormLabel>
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
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría *</FormLabel>
                <Select 
                  disabled={isSubmitting}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(categoryDisplayNames).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="Información adicional sobre el gasto"
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receipt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Comprobante</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://dgi.mef.gob.pa/factura/8B7C3D2A" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                URL de la factura electrónica o sistema de validación (ej: https://dgi.mef.gob.pa/factura/123ABC) para 
                acceder rápidamente al documento original
              </FormDescription>
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
              'Guardar gasto'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
