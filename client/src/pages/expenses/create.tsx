import { useState } from "react";
import { useLocation } from "wouter";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ExpenseCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const res = await apiRequest("POST", "/api/expenses", expenseData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Gasto registrado",
        description: "El gasto ha sido registrado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      navigate("/expenses");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error al registrar gasto",
        description: "No se pudo registrar el gasto. Intente de nuevo más tarde.",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (data: any) => {
    setIsSubmitting(true);
    // Format amount as string for API
    const formattedData = {
      ...data,
      amount: data.amount.toString()
    };
    createExpenseMutation.mutate(formattedData);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Registrar Nuevo Gasto</h1>
          <p className="text-gray-500 mt-1">Registra y categoriza tus gastos</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/expenses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </>
  );
}
