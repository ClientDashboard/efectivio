import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Client } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CheckIcon, Loader2, Mail } from "lucide-react";

interface SendInvitationDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Esquema de validación
const invitationSchema = z.object({
  clientId: z.number(),
  email: z.string().email("Ingresa un email válido"),
  expiryDays: z.number().or(z.string().transform(val => parseInt(val))),
  message: z.string().optional(),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

export function SendInvitationDialog({
  client,
  open,
  onOpenChange,
}: SendInvitationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invitationSent, setInvitationSent] = useState(false);

  // Formulario
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      clientId: client.id,
      email: client.email || "",
      expiryDays: 7,
      message: "",
    },
  });

  // Mutación para enviar la invitación
  const sendInvitationMutation = useMutation({
    mutationFn: async (data: InvitationFormValues) => {
      const res = await apiRequest("POST", "/api/clients/portal/invite", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al enviar invitación");
      }
      return res.json();
    },
    onSuccess: () => {
      setInvitationSent(true);
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Invitación enviada",
        description: "El cliente ha sido invitado al portal",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enviar formulario
  function onSubmit(data: InvitationFormValues) {
    sendInvitationMutation.mutate(data);
  }

  // Cerrar diálogo y resetear estado
  function handleClose() {
    if (!sendInvitationMutation.isPending) {
      setInvitationSent(false);
      onOpenChange(false);
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invitar al Portal del Cliente</DialogTitle>
          <DialogDescription>
            Envía una invitación por correo electrónico a {client.displayName || client.companyName} para acceder al portal de clientes.
          </DialogDescription>
        </DialogHeader>

        {invitationSent ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-center">¡Invitación enviada!</h3>
            <p className="text-center text-muted-foreground">
              Se ha enviado una invitación a {form.getValues().email}
            </p>
            <Button onClick={handleClose} className="mt-4">
              Cerrar
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="cliente@ejemplo.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Se enviará un correo con el enlace de acceso.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de validez</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el período de validez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 día</SelectItem>
                        <SelectItem value="3">3 días</SelectItem>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tiempo de validez del enlace de invitación.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje personalizado (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mensaje adicional para el cliente"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={sendInvitationMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={sendInvitationMutation.isPending}
                >
                  {sendInvitationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar invitación
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}