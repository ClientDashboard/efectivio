import { useState } from 'react';
import { Link } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';

// Esquema de validación para recuperar contraseña
const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
});

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Configuración del formulario con react-hook-form
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  // Manejar envío del formulario
  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    setIsPending(true);

    try {
      const { success, error } = await resetPassword(values.email);

      if (success) {
        setIsSuccess(true);
        toast({
          title: 'Correo enviado',
          description: 'Te hemos enviado un enlace para restablecer tu contraseña.',
        });
      } else {
        toast({
          title: 'Error',
          description: error || 'No se pudo enviar el correo de recuperación',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado',
        variant: 'destructive'
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Recuperar contraseña</CardTitle>
          <CardDescription className="text-center">
            Te enviaremos un correo con instrucciones para recuperar tu acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Hemos enviado un correo a la dirección proporcionada con instrucciones para restablecer tu contraseña.
              </p>
              <p className="text-sm text-muted-foreground">
                Revisa tu bandeja de entrada (y la carpeta de spam) y sigue las instrucciones.
              </p>
              <Button asChild className="mt-4">
                <Link to="/auth/sign-in">Volver a inicio de sesión</Link>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="correo@ejemplo.com" 
                          {...field} 
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center text-muted-foreground w-full">
            <Link to="/auth/sign-in">
              <a className="underline text-primary hover:text-primary/90">Volver a inicio de sesión</a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}