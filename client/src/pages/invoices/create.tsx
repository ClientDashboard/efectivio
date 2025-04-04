import { useState } from "react";
import { useLocation } from "wouter";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function InvoiceCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients for dropdown
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes. Intente de nuevo más tarde.",
      });
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const res = await apiRequest("POST", "/api/invoices", invoiceData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Factura creada",
        description: "La factura ha sido creada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      navigate("/invoices");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error al crear factura",
        description: "No se pudo crear la factura. Intente de nuevo más tarde.",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (data: any) => {
    setIsSubmitting(true);
    
    // Prepare the data for the API
    const formattedData = {
      invoice: {
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        status: data.status,
        subtotal: data.subtotal.toString(),
        taxAmount: data.taxAmount.toString(),
        total: data.total.toString(),
        notes: data.notes
      },
      items: data.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
        taxRate: (item.taxRate || "0").toString()
      }))
    };
    
    createInvoiceMutation.mutate(formattedData);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Crear Nueva Factura</h1>
          <p className="text-gray-500 mt-1">Crea una factura para tus clientes</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Factura</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingClients ? (
            <div className="py-8 text-center">Cargando datos de clientes...</div>
          ) : (
            <InvoiceForm 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting}
              clients={clients || []}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
