import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, Plus, Trash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, addDays } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface Client {
  id: number;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const formSchema = z.object({
  clientId: z.coerce.number().min(1, 'Selecciona un cliente'),
  quoteNumber: z.string().min(1, 'Ingresa un número de cotización'),
  issueDate: z.string().min(1, 'Selecciona una fecha de emisión'),
  expiryDate: z.string().min(1, 'Selecciona una fecha de vencimiento'),
  subtotal: z.string().min(1, 'Calcula el subtotal'),
  taxAmount: z.string().optional(),
  total: z.string().min(1, 'Calcula el total'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Ingresa una descripción'),
      quantity: z.string().min(1, 'Ingresa una cantidad'),
      unitPrice: z.string().min(1, 'Ingresa un precio unitario'),
      amount: z.string().min(1, 'Calcula el monto'),
      taxRate: z.string().optional(),
    })
  ).min(1, 'Agrega al menos un ítem'),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuoteCreatePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isCalculating, setIsCalculating] = useState(false);

  const defaultValues: Partial<FormValues> = {
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    quoteNumber: `COT-${Date.now().toString().slice(-6)}`,
    subtotal: '0',
    taxAmount: '0',
    total: '0',
    items: [
      {
        description: '',
        quantity: '1',
        unitPrice: '0',
        amount: '0',
        taxRate: '0',
      },
    ],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    refetchOnWindowFocus: false,
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { items, ...quote } = data;
      const res = await apiRequest('POST', '/api/quotes', { quote, items });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear la cotización');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Cotización creada',
        description: 'La cotización se ha creado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      navigate('/quotes');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createQuoteMutation.mutate(data);
  };

  const calculateItemAmount = (index: number) => {
    const values = form.getValues();
    const item = values.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const amount = (quantity * unitPrice).toFixed(2);
    
    form.setValue(`items.${index}.amount`, amount);
    calculateTotals();
  };

  const calculateTotals = () => {
    setIsCalculating(true);
    
    const values = form.getValues();
    let subtotal = 0;
    let taxAmount = 0;
    
    values.items.forEach(item => {
      const amount = parseFloat(item.amount) || 0;
      subtotal += amount;
      
      const taxRate = parseFloat(item.taxRate || '0') || 0;
      const itemTax = amount * (taxRate / 100);
      taxAmount += itemTax;
    });
    
    const total = subtotal + taxAmount;
    
    form.setValue('subtotal', subtotal.toFixed(2));
    form.setValue('taxAmount', taxAmount.toFixed(2));
    form.setValue('total', total.toFixed(2));
    
    setIsCalculating(false);
  };

  const addItem = () => {
    const values = form.getValues();
    const items = values.items || [];
    
    form.setValue('items', [
      ...items,
      {
        description: '',
        quantity: '1',
        unitPrice: '0',
        amount: '0',
        taxRate: '0',
      },
    ]);
  };

  const removeItem = (index: number) => {
    const values = form.getValues();
    const items = values.items || [];
    
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      form.setValue('items', newItems);
      setTimeout(() => calculateTotals(), 0);
    } else {
      toast({
        title: 'Error',
        description: 'Debe haber al menos un ítem en la cotización',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '$0.00';
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(number);
  };

  const isSubmitting = form.formState.isSubmitting || createQuoteMutation.isPending;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:gap-0 md:justify-between md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/quotes">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización</h1>
          </div>
          <p className="text-muted-foreground">
            Crea una nueva cotización para un cliente
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Proporciona la información básica de la cotización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                        disabled={isLoadingClients}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingClients ? (
                            <div className="flex justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            clients && clients.map((client: Client) => (
                              <SelectItem
                                key={client.id}
                                value={client.id.toString()}
                              >
                                {client.companyName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quoteNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de cotización</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="COT-000123"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de emisión</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de vencimiento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la cotización</CardTitle>
              <CardDescription>
                Agrega los ítems que deseas incluir en esta cotización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-8 bg-muted p-3 text-sm font-medium">
                  <div className="col-span-4">Descripción</div>
                  <div className="col-span-1 text-center">Cantidad</div>
                  <div className="col-span-1 text-center">Precio</div>
                  <div className="col-span-1 text-center">IVA %</div>
                  <div className="col-span-1 text-center">Importe</div>
                </div>
                {form.getValues().items?.map((_, index) => (
                  <div key={index} className="grid grid-cols-8 p-3 text-sm border-t">
                    <div className="col-span-4 pr-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Descripción del ítem"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 px-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                disabled={isSubmitting}
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateItemAmount(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 px-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                disabled={isSubmitting}
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateItemAmount(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 px-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                {...field}
                                disabled={isSubmitting}
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateTotals();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={isSubmitting}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="p-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar ítem
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(form.getValues().subtotal || '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IVA:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(form.getValues().taxAmount || '0')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(form.getValues().total || '0')}
                    </span>
                  </div>

                  <div className="grid gap-2 grid-cols-3 hidden">
                    <FormField
                      control={form.control}
                      name="subtotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} disabled className="hidden" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} disabled className="hidden" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="total"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} disabled className="hidden" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas y condiciones</CardTitle>
              <CardDescription>
                Agrega notas o condiciones a la cotización (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales para el cliente"
                          className="min-h-32"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Estas notas serán visibles para el cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Términos y condiciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Términos y condiciones de la cotización"
                          className="min-h-32"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluye información sobre validez, pagos, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/quotes')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isCalculating}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cotización
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}