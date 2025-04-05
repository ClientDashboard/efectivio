import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Esquema de validación para el formulario de inicio de sesión
const loginSchema = z.object({
  email: z.string().email({ message: 'Introduce un correo electrónico válido' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ClientPortalLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session) {
        // Si ya hay una sesión activa, verificar si pertenece a un usuario del portal
        try {
          const { data: userData, error: userError } = await supabase
            .from('client_portal_users')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (userData && !userError) {
            setLocation('/portal/dashboard');
          } else {
            // Si hay sesión pero no es un usuario del portal, cerrar sesión
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error("Error verificando usuario del portal:", error);
        }
      }
    };
    
    checkSession();
  }, [setLocation]);

  // Formulario
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Manejar inicio de sesión con correo/contraseña
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (authData.session) {
        const userId = authData.session.user.id;
        
        // Verificar si el usuario pertenece a un cliente del portal
        const { data: portalUserData, error: portalUserError } = await supabase
          .from('client_portal_users')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (portalUserError || !portalUserData) {
          // Usuario no autorizado, cerrar sesión
          await supabase.auth.signOut();
          throw new Error('Tu cuenta no tiene acceso al portal de clientes');
        }
        
        // Usuario autorizado, mostrar mensaje y redirigir
        toast({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión correctamente',
        });
        
        setLocation('/portal/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error de inicio de sesión',
        description: error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Inicio de sesión con Google
  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    
    try {
      // Redirección a Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal/google-callback`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: 'Error al iniciar sesión con Google',
        description: error.message || 'No se pudo iniciar el proceso de autenticación con Google.',
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sección de formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <Helmet>
          <title>Iniciar Sesión | Portal de Cliente | Efectivio</title>
        </Helmet>
        
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              Efectivio
            </h1>
            <h2 className="text-lg text-muted-foreground">Portal de Cliente</h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede a tu cuenta en el portal de cliente
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Continuar con Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      O continúa con
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
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="tu@ejemplo.com" 
                              type="email" 
                              {...field} 
                              disabled={isLoading}
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
                              placeholder="Tu contraseña" 
                              type="password" 
                              {...field} 
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Iniciar sesión
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={() => setLocation('/portal/register')}
                  className="text-primary hover:underline"
                  disabled={isLoading || isGoogleLoading}
                >
                  Regístrate aquí
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Sección de información */}
      <div className="hidden md:block flex-1 bg-primary p-12 text-white">
        <div className="h-full flex flex-col justify-center max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6">Portal de Cliente Efectivio</h2>
          
          <p className="mb-8 text-lg">
            Accede a toda la información de tu contabilidad, colabora con tu contador y gestiona tus documentos de forma 
            segura y eficiente.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Acceso a tus finanzas</h3>
                <p className="text-primary-foreground/80">Consulta tus facturas, cotizaciones y estado financiero.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Gestión de documentos</h3>
                <p className="text-primary-foreground/80">Archiva y accede a tus documentos importantes en cualquier momento.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Comunicación directa</h3>
                <p className="text-primary-foreground/80">Mantén comunicación constante con tu contador para resolver dudas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}