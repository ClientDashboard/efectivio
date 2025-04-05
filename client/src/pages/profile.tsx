import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;
  
  // Estados para los campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Obtener los datos del perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: () => fetch('/api/profile').then(res => res.json()),
    enabled: !!userId,
    onError: (error) => {
      toast({
        title: 'Error al cargar el perfil',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Actualizar los campos cuando se carguen los datos del perfil
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setDisplayName(profile.display_name || profile.name || '');
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile]);
  
  // Mutación para actualizar el perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: 'Perfil actualizado',
        description: 'Tu información se ha actualizado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar el perfil',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Manejador para subir avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  // Manejador para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      email,
      display_name: displayName,
    };
    
    // Si hay un nuevo avatar, subirlo primero
    if (avatar) {
      setIsUploading(true);
      
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('avatar', avatar);
        
        const uploadResponse = await fetch('/api/avatar', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const { avatarUrl } = await uploadResponse.json();
        formData.avatar_url = avatarUrl;
      } catch (error) {
        toast({
          title: 'Error al subir la imagen',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    }
    
    updateProfileMutation.mutate(formData);
  };
  
  // Generar iniciales para el avatar
  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container py-6"
      >
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información de perfil y cómo quieres aparecer en la plataforma.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                      </Avatar>
                      
                      <Label
                        htmlFor="avatar-upload"
                        className="cursor-pointer text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md flex items-center"
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Subir imagen
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG o WEBP. Máximo 2MB.
                      </p>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@correo.com"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="displayName">
                          ¿Cómo te gustaría aparecer en el dashboard?
                        </Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Nombre para mostrar"
                        />
                        <p className="text-xs text-muted-foreground">
                          Este nombre aparecerá en el saludo del dashboard y en otras partes de la aplicación.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending || isUploading}
                  >
                    {(updateProfileMutation.isPending || isUploading) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar cambios
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
                <CardDescription>
                  Personaliza tu experiencia en la plataforma.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Aquí irían más opciones de preferencias como tema, notificaciones, etc. */}
                <p className="text-muted-foreground text-center py-8">
                  Próximamente: opciones de personalización adicionales
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}