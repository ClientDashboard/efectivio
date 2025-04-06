import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/protected-route';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Esquema de validación para el formulario de registro
const registerSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  fullName: z.string().min(3, 'Nombre completo es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export default function SignUpPage() {
  const { isLoaded, signUp } = useAuth();
  
  const [isPending, setIsPending] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Configuración del formulario con react-hook-form
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Manejar envío del formulario
  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    console.log("Formulario enviado", values);
    
    if (!isLoaded) {
      console.log("Auth no está cargado");
      return;
    }
    
    setIsPending(true);
    console.log("signUp disponible:", !!signUp);

    try {
      const [firstName, ...lastNameParts] = values.fullName.split(' ');
      const lastName = lastNameParts.join(' ');
      
      console.log("Intentando crear usuario con:", {
        email: values.email,
        firstName,
        lastName: lastName || undefined
      });
      
      if (!signUp || typeof signUp.create !== 'function') {
        throw new Error("La función de registro no está disponible");
      }
      
      const result = await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName,
        lastName: lastName || undefined,
      });
      
      console.log("Resultado del registro:", result);

      // Iniciar proceso de verificación de email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifyEmail(true);
      
      toast({
        title: 'Registro exitoso',
        description: 'Te hemos enviado un código de verificación a tu correo electrónico.',
      });
    } catch (err: any) {
      console.error("Error en el registro:", err);
      toast({
        title: 'Error al registrarse',
        description: err.message || err.errors?.[0]?.message || 'No se pudo completar el registro',
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
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para registrarte en Efectivio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!verifyEmail ? (
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
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Juan Pérez" 
                          {...field} 
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="******" 
                          {...field} 
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="******" 
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
                      Creando cuenta...
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-muted-foreground mb-4">
                Hemos enviado un código de verificación a tu correo electrónico.
                Ingresa el código a continuación para completar tu registro:
              </p>
              
              <div className="w-full">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const code = (e.target as any).code.value;
                    
                    if (!code || code.length < 6) {
                      toast({
                        title: "Código inválido",
                        description: "Por favor ingresa el código completo que recibiste",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    setIsPending(true);
                    
                    try {
                      const completeSignUp = await signUp.attemptEmailAddressVerification({
                        code,
                      });
                      
                      if (completeSignUp.status === "complete") {
                        toast({
                          title: "Verificación exitosa",
                          description: "Tu cuenta ha sido verificada correctamente"
                        });
                        
                        window.location.href = "/auth/sign-in";
                      } else {
                        toast({
                          title: "Error",
                          description: "No se pudo verificar tu cuenta. Por favor intenta nuevamente.",
                          variant: "destructive"
                        });
                      }
                    } catch (err: any) {
                      toast({
                        title: "Error de verificación",
                        description: err.errors?.[0]?.message || "Código inválido o expirado",
                        variant: "destructive"
                      });
                    } finally {
                      setIsPending(false);
                    }
                  }}
                  className="space-y-4 w-full"
                >
                  <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium">
                      Código de verificación
                    </label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="Ingresa el código de 6 dígitos"
                      maxLength={6}
                      disabled={isPending}
                      className="w-full"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar correo'
                    )}
                  </Button>
                </form>
                
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/auth/sign-in'}
                    className="w-full"
                  >
                    Cancelar y volver a Iniciar Sesión
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center text-muted-foreground w-full">
            ¿Ya tienes una cuenta?{' '}
            <a href="/auth/sign-in" className="underline text-primary hover:text-primary/90">
              Iniciar Sesión
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}