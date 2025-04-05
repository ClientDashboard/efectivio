import { useState } from "react";
import { useLocation } from "wouter";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { InsertClient } from "@shared/schema";
import { Helmet } from "react-helmet-async";

export default function ClientCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createClientMutation = useMutation({
    mutationFn: async (clientData: InsertClient) => {
      const res = await apiRequest("POST", "/api/clients", clientData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      navigate("/clients");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error al crear cliente",
        description: "No se pudo crear el cliente. Intente de nuevo más tarde.",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (data: InsertClient) => {
    setIsSubmitting(true);
    createClientMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Crear Nuevo Cliente | Efectivio</title>
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Crear Nuevo Cliente</h1>
          <p className="text-gray-500 mt-1">Ingresa la información del cliente</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </>
  );
}
