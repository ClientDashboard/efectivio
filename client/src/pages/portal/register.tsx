import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Esquema de validación para el formulario de registro
const registerSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Introduce un correo electrónico válido' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  invitationToken: z.string().min(1, { message: 'El token de invitación es requerido' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function ClientPortalRegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [tokenValidationStatus, setTokenValidationStatus] = useState<'loading' | 'valid' | 'invalid' | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [clientName, setClientName] = useState('');
  
  // Obtener el token de la URL
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get('token') || '';
  
  // Formulario
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      invitationToken: tokenFromUrl,
    },
  });
  
  // Verificar el token al cargar la página
  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken();
    }
    
    // Verificar si ya hay una sesión activa
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Si ya hay sesión, redirigir al dashboard
        const { data: userData } = await supabase
          .from('client_portal_users')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
          
        if (userData) {
          setLocation('/portal/dashboard');
        }
      }
    };
    
    checkSession();
  }, [tokenFromUrl]);
  
  // Función para verificar el token de invitación
  async function verifyToken() {
    if (!tokenFromUrl) return;
    
    setTokenValidationStatus('loading');
    
    try {
      const response = await fetch(`/api/client-portal/invitations/${tokenFromUrl}/validate`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'El token de invitación no es válido');
      }
      
      // Token válido
      setTokenValidationStatus('valid');
      setClientName(data.clientName || '');
      
      // Prellenar el email si está disponible en la respuesta
      if (data.email) {
        form.setValue('email', data.email);
      }
      
    } catch (error: any) {
      setTokenValidationStatus('invalid');
      setTokenError(error.message || 'No se pudo validar el token de invitación');
    }
  }
  
  // Manejar registro con correo/contraseña
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    
    try {
      // 1. Registrar al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('No se pudo crear la cuenta');
      }
      
      // 2. Registrar el usuario en el portal de clientes
      const response = await fetch('/api/client-portal/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.user.id,
          name: data.name,
          email: data.email,
          invitationToken: data.invitationToken,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Si falla el registro en el portal, eliminar el usuario de Supabase Auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(responseData.message || 'Error al registrar la cuenta');
      }
      
      // Registro exitoso
      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
      });
      
      // Redirigir a la página de inicio de sesión
      setLocation('/portal/login');
      
    } catch (error: any) {
      toast({
        title: 'Error de registro',
        description: error.message || 'No se pudo completar el registro. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Registro con Google
  async function signInWithGoogle() {
    if (!tokenFromUrl || tokenValidationStatus !== 'valid') {
      toast({
        title: 'Error de validación',
        description: 'El token de invitación no es válido o no ha sido verificado',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGoogleLoading(true);
    
    try {
      // Almacenar el token en localStorage para usarlo después del callback de Google
      localStorage.setItem('invitationToken', tokenFromUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal/google-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
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
  
  // Mostrar mensaje de error si el token no es válido
  if (tokenValidationStatus === 'invalid') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Helmet>
          <title>Error de validación | Portal de Cliente | Efectivio</title>
        </Helmet>
        
        <div className="w-full max-w-md text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            Efectivio
          </h1>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Token de invitación inválido</AlertTitle>
            <AlertDescription>
              {tokenError || 'El link de invitación ha expirado o no es válido. Por favor, contacta a tu contador para recibir una nueva invitación.'}
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={() => setLocation('/portal/login')}
            className="mt-4"
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }
  
  // Mostrar indicador de carga mientras se verifica el token
  if (tokenValidationStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Helmet>
          <title>Verificando invitación | Portal de Cliente | Efectivio</title>
        </Helmet>
        
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Verificando invitación</h2>
          <p className="text-muted-foreground">
            Por favor espera mientras verificamos tu invitación...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sección de formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <Helmet>
          <title>Registro | Portal de Cliente | Efectivio</title>
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
              <CardTitle>Crear cuenta</CardTitle>
              <CardDescription>
                {clientName 
                  ? `Completa tu registro como cliente de ${clientName}`
                  : 'Completa tu registro para acceder al portal de cliente'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading || isLoading || tokenValidationStatus !== 'valid'}
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
                      O regístrate con
                    </span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre completo" 
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
                              placeholder="Crea una contraseña segura" 
                              type="password" 
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
                      name="invitationToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token de invitación</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || isGoogleLoading || tokenValidationStatus !== 'valid'}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Completar registro
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <button
                  onClick={() => setLocation('/portal/login')}
                  className="text-primary hover:underline"
                  disabled={isLoading || isGoogleLoading}
                >
                  Inicia sesión aquí
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
            Bienvenido al Portal de Cliente de Efectivio. Al registrarte tendrás acceso a:
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Tu información financiera</h3>
                <p className="text-primary-foreground/80">Acceso a tus facturas, cotizaciones y reportes financieros.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Archivos compartidos</h3>
                <p className="text-primary-foreground/80">Todos tus documentos organizados y fácilmente accesibles.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Colaboración directa</h3>
                <p className="text-primary-foreground/80">Comunícate con tu contador y mantente al día con tus finanzas.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Seguridad avanzada</h3>
                <p className="text-primary-foreground/80">Tu información siempre protegida con las mejores prácticas de seguridad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}