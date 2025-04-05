import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GoogleCallbackPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Obtener la sesión actual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          setStatus('error');
          setErrorMessage('No se pudo completar el inicio de sesión con Google.');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Verificar si el usuario pertenece a un cliente del portal
        const { data: portalUserData, error: portalUserError } = await supabase
          .from('client_portal_users')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (portalUserError || !portalUserData) {
          // Usuario no autorizado, cerrar sesión
          await supabase.auth.signOut();
          setStatus('error');
          setErrorMessage('Tu cuenta de Google no tiene acceso al portal de clientes.');
          return;
        }
        
        // Usuario autorizado, redirigir al dashboard
        setStatus('success');
        
        toast({
          title: 'Inicio de sesión exitoso',
          description: '¡Bienvenido al Portal del Cliente!',
        });
        
        // Redirigir al dashboard después de un breve retraso
        setTimeout(() => {
          setLocation('/portal/dashboard');
        }, 1500);
        
      } catch (error) {
        console.error('Error en el callback de Google:', error);
        setStatus('error');
        setErrorMessage('Ha ocurrido un error durante el proceso de autenticación.');
      }
    }

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Helmet>
        <title>Completando inicio de sesión | Efectivio</title>
      </Helmet>

      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          Efectivio
        </h1>
        
        <div className="bg-card rounded-lg shadow-lg p-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Completando inicio de sesión</h2>
              <p className="text-muted-foreground">
                Estamos verificando tu cuenta, por favor espera un momento...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">¡Inicio de sesión exitoso!</h2>
              <p className="text-muted-foreground">
                Redirigiendo al portal del cliente...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de autenticación</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'No se pudo completar el inicio de sesión.'}
                </AlertDescription>
              </Alert>
              
              <button
                onClick={() => setLocation('/portal/login')}
                className="text-primary hover:underline mt-4"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}