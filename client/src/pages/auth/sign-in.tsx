import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useSignIn as useClerkSignIn } from '@clerk/clerk-react';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/protected-route';
import { useAuthMode } from '@/lib/clerk-provider';

// Esquema de validación para el formulario de inicio de sesión
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export default function SignInPage() {
  const { mode } = useAuthMode();
  const auth = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Configuración del formulario con react-hook-form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Manejar envío del formulario
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (!auth.isLoaded) {
      return;
    }
    
    setIsPending(true);

    try {
      let result;
      
      if (mode === 'development') {
        // Usar DevAuth en modo desarrollo
        result = await auth.signIn.create({
          identifier: values.email,
          password: values.password,
        });
      } else {
        // Usar Clerk en modo producción
        result = await auth.signIn.create({
          identifier: values.email,
          password: values.password,
        });
      }

      if (result.status === "complete") {
        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Bienvenido a Efectivio',
        });
        // Usar redirección nativa en lugar de la navegación de Wouter
        window.location.href = '/dashboard';
      } else {
        toast({
          title: 'Error al iniciar sesión',
          description: 'El proceso de inicio de sesión no se completó',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error al iniciar sesión',
        description: err.errors?.[0]?.message || 'Credenciales incorrectas',
        variant: 'destructive'
      });
    } finally {
      setIsPending(false);
    }
  };

  // Manejar inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    if (!auth.isLoaded) return;
    
    try {
      if (mode === 'development') {
        // En desarrollo, simulamos el inicio de sesión con Google
        const result = await auth.signIn.create({
          identifier: 'google-user@example.com',
          password: 'password123',
        });
        
        if (result.status === "complete") {
          window.location.href = '/dashboard';
        }
      } else {
        // En producción, usamos la autenticación real de Google con Clerk
        await auth.signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/dashboard",
          redirectUrlComplete: "/dashboard"
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error al iniciar sesión con Google',
        description: err.message || 'No se pudo completar el inicio de sesión',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
            {mode === 'development' && (
              <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
                Modo desarrollo - La autenticación es simulada
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botón de Google */}
          <Button 
            variant="outline" 
            className="w-full mb-5 flex items-center justify-center" 
            onClick={handleGoogleSignIn}
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
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            ¿Olvidaste tu contraseña?{' '}
            <a href="/auth/reset-password" className="underline text-primary hover:text-primary/90">
              Recuperar
            </a>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <a href="/auth/sign-up" className="underline text-primary hover:text-primary/90">
              Regístrate
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}