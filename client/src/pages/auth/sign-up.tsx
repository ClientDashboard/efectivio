import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useSignUp as useClerkSignUp } from '@clerk/clerk-react';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/protected-route';
import { useAuthMode } from '@/lib/clerk-provider';

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
  const { mode } = useAuthMode();
  const auth = useAuth();
  
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
    if (!auth.isLoaded) {
      return;
    }
    
    setIsPending(true);

    try {
      const [firstName, ...lastNameParts] = values.fullName.split(' ');
      const lastName = lastNameParts.join(' ');
      
      let result;
      
      if (mode === 'development') {
        // En modo desarrollo, usamos la autenticación simulada
        if (auth && auth.signUp) {
          result = await auth.signUp.create({
            emailAddress: values.email,
            password: values.password,
            firstName,
            lastName: lastName || undefined,
          });
          
          // En desarrollo, no enviamos código de verificación real
          setVerifyEmail(false);
          
          toast({
            title: 'Registro exitoso',
            description: 'Cuenta creada correctamente en modo desarrollo.',
          });
          
          // Redirigir directamente al dashboard
          window.location.href = '/dashboard';
        } else {
          throw new Error("La función de registro no está disponible");
        }
      } else {
        // En producción, usamos Clerk
        if (auth && auth.signUp) {
          result = await auth.signUp.create({
            emailAddress: values.email,
            password: values.password,
            firstName,
            lastName: lastName || undefined,
          });

          // Iniciar proceso de verificación de email
          await auth.signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });

          setVerifyEmail(true);
          
          toast({
            title: 'Registro exitoso',
            description: 'Te hemos enviado un código de verificación a tu correo electrónico.',
          });
        } else {
          throw new Error("La función de registro no está disponible");
        }
      }
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

  // Manejar registro con Google
  const handleGoogleSignUp = async () => {
    if (!auth.isLoaded) return;
    
    try {
      if (mode === 'development') {
        // En desarrollo, simulamos el registro con Google
        if (auth && auth.signUp) {
          const result = await auth.signUp.create({
            emailAddress: 'google-user@example.com',
            password: 'password123',
            firstName: 'Usuario',
            lastName: 'Google',
          });
          
          toast({
            title: 'Registro exitoso',
            description: 'Cuenta creada correctamente con Google (simulado).',
          });
          
          // Redirigir directamente al dashboard
          window.location.href = '/dashboard';
        } else {
          throw new Error("La función de registro no está disponible");
        }
      } else {
        // En producción, usamos la autenticación real de Google con Clerk
        if (auth && auth.signUp && auth.signUp.authenticateWithRedirect) {
          await auth.signUp.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/dashboard",
            redirectUrlComplete: "/dashboard"
          });
        } else {
          throw new Error("La función de autenticación con Google no está disponible");
        }
      }
    } catch (err: any) {
      console.error("Error al registrarse con Google:", err);
      toast({
        title: 'Error al registrarse con Google',
        description: err.message || 'No se pudo completar el registro',
        variant: 'destructive'
      });
    }
  };

  // Función para manejar la verificación del código
  const handleVerifyCode = async (code: string) => {
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
      if (!auth || !auth.signUp) {
        throw new Error("La función de verificación no está disponible");
      }
      
      const completeSignUp = await auth.signUp.attemptEmailAddressVerification({
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
      console.error("Error de verificación:", err);
      toast({
        title: "Error de verificación",
        description: err.errors?.[0]?.message || err.message || "Código inválido o expirado",
        variant: "destructive"
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
            {mode === 'development' && (
              <span className="block mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
                Modo desarrollo - La autenticación es simulada
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!verifyEmail ? (
            <>
              {/* Botón de Google */}
              <Button 
                variant="outline" 
                className="w-full mb-5 flex items-center justify-center" 
                onClick={handleGoogleSignUp}
                disabled={isPending || !auth.isLoaded}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Continuar con Google
              </Button>
              
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O con tu correo
                  </span>
                </div>
              </div>
            
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
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center text-muted-foreground mb-4">
                Hemos enviado un código de verificación a tu correo electrónico.
                Ingresa el código a continuación para completar tu registro:
              </div>
              
              <div className="w-full">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const code = (e.target as any).code.value;
                    await handleVerifyCode(code);
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