import { useState } from "react";
import { Client } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface DeleteClientConfirmationProps {
  client: Client;
  children?: React.ReactNode;
}

export function DeleteClientConfirmation({ client, children }: DeleteClientConfirmationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmationInput, setConfirmationInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // El texto de confirmación que el usuario debe escribir
  const confirmationText = client.name.toLocaleLowerCase();
  
  // Verificar si el texto de confirmación coincide
  const isConfirmationValid = confirmationInput.toLocaleLowerCase() === confirmationText;

  // Mutación para eliminar el cliente
  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Obtener nombre de usuario actual
      const userResponse = await apiRequest("GET", "/api/user");
      const user = await userResponse.json();
      
      // Enviar solicitud para eliminar cliente con datos del usuario que lo eliminó
      return apiRequest("DELETE", `/api/clients/${client.id}`, {
        deletedBy: user.id,
        deletedByUsername: user.username,
        deletedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      // Actualizar la caché
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      toast({
        title: "Cliente eliminado",
        description: `El cliente ${client.companyName || client.name} ha sido eliminado con éxito.`,
      });
      
      // Cerrar el diálogo
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Al cerrar el diálogo, resetear el texto de confirmación
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setConfirmationInput("");
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm" className="ml-2">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Eliminar Cliente</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <p>
                ¿Estás seguro que deseas eliminar a{" "}
                <span className="font-semibold">{client.companyName || client.name}</span>?
              </p>
              
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">Advertencia:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    Se eliminarán TODOS los datos asociados a este cliente (facturas, cotizaciones, archivos, etc).
                  </li>
                  <li>
                    Esta acción es irreversible y no hay forma de recuperar los datos.
                  </li>
                  <li>
                    Se mantendrá un registro de esta eliminación con datos del usuario que la realizó.
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Label htmlFor="confirmation" className="block font-medium text-sm mb-1">
                  Para confirmar, escribe el nombre del cliente: <span className="font-bold">{confirmationText}</span>
                </Label>
                <Input
                  id="confirmation"
                  placeholder={`Escribe "${confirmationText}" para confirmar`}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive"
            disabled={!isConfirmationValid || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="ml-2"
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar Cliente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}