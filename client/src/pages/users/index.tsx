import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import UserForm from "@/components/users/user-form";
import EditUserDialog from "@/components/users/edit-user-dialog";
import DeleteUserConfirmation from "@/components/users/delete-user-confirmation";
import ChangePasswordDialog from "@/components/users/change-password-dialog";

// Mapa de roles para mostrar en español
const roleLabels: Record<string, string> = {
  gerente_general: "Gerente General",
  contabilidad: "Contabilidad",
  director_ventas: "Director de Ventas",
  director_recursos_humanos: "Director de Recursos Humanos",
  director_produccion: "Director de Producción",
  director_logistica: "Director de Logística",
  operario: "Operario",
  vendedor: "Vendedor",
  administrador_sistema: "Administrador del Sistema",
};

export default function UsersPage() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { toast } = useToast();

  // Obtener la lista de usuarios
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
      }
      return response.json();
    },
  });

  // Filtrar usuarios según el texto de búsqueda
  const filteredUsers = users.filter((user: any) => {
    const searchText = filterText.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchText)) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchText)) ||
      (user.email && user.email.toLowerCase().includes(searchText)) ||
      (roleLabels[user.role] && roleLabels[user.role].toLowerCase().includes(searchText))
    );
  });

  // Manejador para cuando se crea un nuevo usuario
  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
    toast({
      title: "Usuario creado",
      description: "El usuario ha sido creado exitosamente",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Gestión de Usuarios" 
        description="Administre los usuarios del sistema y sus roles"
        icon="users"
      />

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar usuarios..."
            className="pl-8"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear nuevo usuario</DialogTitle>
              <DialogDescription>
                Complete el formulario para crear un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <UserForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-lg">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">
            Lista de usuarios registrados en el sistema y sus roles asignados
          </p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-6 text-destructive">
              <p>Error al cargar los usuarios. Por favor, intente nuevamente.</p>
              <Button onClick={() => refetch()} className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {filterText ? (
                <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
              ) : (
                <p>No hay usuarios registrados en el sistema.</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre completo</TableHead>
                    <TableHead>Correo electrónico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive !== false ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <EditUserDialog user={user} onSuccess={() => refetch()} />
                        <ChangePasswordDialog userId={user.id} userName={user.username} />
                        <DeleteUserConfirmation
                          userId={user.id}
                          userName={user.fullName || user.username}
                          onSuccess={() => refetch()}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}