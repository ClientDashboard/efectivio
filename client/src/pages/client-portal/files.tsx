import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client } from '@shared/schema';
import { Loader2, FileIcon, FolderIcon, Download, Eye } from 'lucide-react';

export default function ClientPortalFiles() {
  const { clientId } = useParams();
  const id = parseInt(clientId || '0');

  // Obtener información del cliente
  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: [`/api/clients/${id}`],
    enabled: !!id && id > 0,
  });

  // Obtener archivos del cliente
  const { data: files, isLoading: filesLoading } = useQuery<any[]>({
    queryKey: [`/api/files/client/${id}`],
    enabled: !!id && id > 0,
  });

  const [currentFolder, setCurrentFolder] = useState('/');
  
  const isLoading = clientLoading || filesLoading;

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center p-8 border border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">Cliente no encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No se pudo encontrar la información de este cliente o no tiene acceso al portal.
          </p>
        </div>
      </div>
    );
  }

  // Filtramos los archivos para mostrar solo los del directorio actual
  const currentFiles = files?.filter(file => {
    const filePath = file.path || '';
    return filePath.startsWith(currentFolder) && 
           !filePath.replace(currentFolder, '').includes('/');
  }) || [];

  // Obtenemos las carpetas en la ruta actual
  const folders = new Set<string>();
  files?.forEach(file => {
    const filePath = file.path || '';
    if (filePath.startsWith(currentFolder) && filePath !== currentFolder) {
      const remainingPath = filePath.replace(currentFolder, '');
      const nextFolder = remainingPath.split('/')[0];
      if (nextFolder) {
        folders.add(nextFolder);
      }
    }
  });

  return (
    <div className="flex-1 space-y-4 p-6">
      <Helmet>
        <title>Archivos | {client.displayName || client.companyName}</title>
      </Helmet>

      <div className="flex justify-between items-start mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Archivos Compartidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Documentos y archivos compartidos con {client.displayName || client.companyName}
          </p>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentFolder('/')}
          disabled={currentFolder === '/'}
        >
          Inicio
        </Button>
        
        {currentFolder !== '/' && currentFolder.split('/').filter(Boolean).map((folder, index, array) => {
          const path = '/' + array.slice(0, index + 1).join('/') + '/';
          return (
            <div key={path} className="flex items-center">
              <span className="mx-1 text-muted-foreground">/</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentFolder(path)}
              >
                {folder}
              </Button>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          {folders.size === 0 && currentFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay archivos en este directorio
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Folders first */}
              {Array.from(folders).map(folder => (
                <Card key={folder} className="cursor-pointer hover:bg-accent/10" onClick={() => setCurrentFolder(`${currentFolder}${folder}/`)}>
                  <CardContent className="p-4 flex items-center space-x-3">
                    <FolderIcon className="h-10 w-10 text-blue-500" />
                    <div>
                      <p className="font-medium">{folder}</p>
                      <p className="text-sm text-muted-foreground">Carpeta</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Then files */}
              {currentFiles.map(file => (
                <Card key={file.id} className="hover:bg-accent/10">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <FileIcon className="h-10 w-10 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name || file.path.split('/').pop()}</p>
                      <p className="text-sm text-muted-foreground">{getFileSize(file.size)}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Función para formatear el tamaño del archivo
function getFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}