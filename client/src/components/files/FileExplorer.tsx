import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Folder, 
  FileText, 
  Image, 
  Film, 
  File, 
  MoreVertical, 
  Download, 
  Eye, 
  Trash2, 
  Upload, 
  Search,
  X
} from 'lucide-react';

// Tipos
interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  category: string;
  clientId?: number | null;
  url?: string;
  createdAt: string;
}

interface FolderItem {
  id: string;
  name: string;
  icon: string;
}

interface FileUploadFormData {
  file: File;
  clientId?: string;
  category?: string;
  folderType?: string;
}

// Constantes
const FOLDER_TYPES = [
  { id: 'clientes', name: 'Clientes', icon: 'users', color: 'text-blue-500' },
  { id: 'facturas', name: 'Facturas', icon: 'receipt', color: 'text-green-500' },
  { id: 'cotizaciones', name: 'Cotizaciones', icon: 'clipboard', color: 'text-amber-500' },
  { id: 'gastos', name: 'Gastos', icon: 'trending-down', color: 'text-red-500' },
  { id: 'productos', name: 'Productos', icon: 'box', color: 'text-purple-500' },
  { id: 'contratos', name: 'Contratos', icon: 'file-text', color: 'text-indigo-500' },
  { id: 'reuniones', name: 'Reuniones', icon: 'video', color: 'text-pink-500' },
];

// Función para formatear el tamaño de los archivos
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para obtener el icono según el tipo de archivo
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <Film className="h-5 w-5 text-purple-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) 
    return <FileText className="h-5 w-5 text-green-500" />;
  if (mimeType.includes('document') || mimeType.includes('word')) 
    return <FileText className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

// Función para obtener el icono de carpeta según el tipo
function getFolderIcon(folderType: string) {
  // Buscar la carpeta en FOLDER_TYPES
  const folder = FOLDER_TYPES.find(f => f.id === folderType.toLowerCase());
  
  if (folder) {
    // Usar la clase de color del FOLDER_TYPES
    return <Folder className={`h-5 w-5 ${folder.color}`} />;
  }
  
  // Colores por defecto si no se encuentra
  switch (folderType.toLowerCase()) {
    case 'clientes':
      return <Folder className="h-5 w-5 text-blue-500" />;
    case 'facturas':
      return <Folder className="h-5 w-5 text-green-500" />;
    case 'cotizaciones':
      return <Folder className="h-5 w-5 text-amber-500" />;
    case 'gastos':
      return <Folder className="h-5 w-5 text-red-500" />;
    case 'productos':
      return <Folder className="h-5 w-5 text-purple-500" />;
    case 'contratos':
      return <Folder className="h-5 w-5 text-indigo-500" />;
    case 'reuniones':
      return <Folder className="h-5 w-5 text-pink-500" />;
    default:
      return <Folder className="h-5 w-5 text-gray-500" />;
  }
}

export default function FileExplorer() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Query para obtener archivos
  const {
    data: files = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/files', selectedFolder],
    queryFn: async () => {
      const endpoint = selectedFolder 
        ? `/api/files?category=${selectedFolder}` 
        : '/api/files';
      const response = await apiRequest('GET', endpoint);
      // Asegurar que el resultado sea un array
      return Array.isArray(response) ? response : [];
    }
  });

  // Mutación para subir archivos
  const uploadMutation = useMutation({
    mutationFn: async (data: FileUploadFormData) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', data.file);
      
      if (data.clientId) {
        formData.append('clientId', data.clientId);
      }
      
      if (data.category) {
        formData.append('category', data.category);
      }
      
      // Simulamos progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      try {
        // Usar fetch directamente para manejar FormData correctamente
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
          // No incluimos content-type ya que fetch lo establece automáticamente para FormData
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
        
        return await response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      setUploadDialogOpen(false);
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar archivos
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => {
      return apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar archivo",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filtrar archivos según la búsqueda
  const filteredFiles = files.filter((file: FileItem) => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar selección de archivo
  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
  };

  // Manejar vista previa de archivo
  const handleViewFile = (file: FileItem) => {
    setSelectedFile(file);
    setFilePreviewOpen(true);
  };

  // Manejar descarga de archivo
  const handleDownloadFile = (file: FileItem) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      toast({
        title: "Error al descargar",
        description: "No se puede acceder a la URL del archivo",
        variant: "destructive",
      });
    }
  };

  // Manejar subida de archivo
  const handleFileUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const form = event.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const categorySelect = form.querySelector('select[name="category"]') as HTMLSelectElement;
    
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const category = categorySelect ? categorySelect.value : selectedFolder || 'general';
      
      uploadMutation.mutate({
        file,
        category
      });
    }
  };

  // Efecto para limpiar el estado cuando se cambia de carpeta
  useEffect(() => {
    setSelectedFile(null);
  }, [selectedFolder]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Barra superior con búsqueda y botón de subida */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar archivos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2" 
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Subir Archivo
        </Button>
      </div>

      {/* Sección principal */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar de carpetas */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-medium text-gray-700 mb-3">Carpetas</h3>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center p-2 rounded-md text-sm ${
                    selectedFolder === null
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  <span>Todos los archivos</span>
                </button>
              </li>
              {FOLDER_TYPES.map((folder) => (
                <li key={folder.id}>
                  <button
                    className={`w-full flex items-center p-2 rounded-md text-sm ${
                      selectedFolder === folder.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    {getFolderIcon(folder.id)}
                    <span className="ml-2">{folder.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Área de contenido */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error al cargar archivos</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <File className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-medium">No hay archivos</h3>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm 
                  ? "No se encontraron archivos con ese término de búsqueda" 
                  : selectedFolder 
                    ? `Esta carpeta está vacía. Sube archivos a ${FOLDER_TYPES.find(f => f.id === selectedFolder)?.name || selectedFolder}.` 
                    : "No hay archivos en el sistema. Sube algunos para empezar."}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => setSelectedFolder(null)}
                  >
                    Mis archivos
                  </Button>
                  {selectedFolder && (
                    <Button size="sm" variant="ghost">
                      {FOLDER_TYPES.find(f => f.id === selectedFolder)?.name || selectedFolder}
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{filteredFiles.length} {filteredFiles.length === 1 ? 'archivo' : 'archivos'}</span>
                </div>
              </div>
              
              {/* Vista de tarjetas estilo Google Drive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Crear carpeta (siempre visible) */}
                <div 
                  className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-[180px]"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">Subir archivo</p>
                  <p className="text-xs text-gray-500 text-center mt-1">Arrastra o haz clic para subir</p>
                </div>
                
                {/* Mostrar archivos como tarjetas */}
                {filteredFiles.map((file: FileItem) => (
                  <div 
                    key={file.id}
                    className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${
                      selectedFile?.id === file.id ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {/* Vista previa del archivo (simulada) */}
                    <div className="h-[120px] bg-gray-100 flex items-center justify-center p-4">
                      {file.mimeType?.startsWith('image/') ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          {file.url ? (
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              className="max-h-full max-w-full object-contain" 
                            />
                          ) : (
                            <Image className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          {getFileIcon(file.mimeType || '')}
                        </div>
                      )}
                    </div>
                    
                    {/* Información del archivo */}
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewFile(file);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(file.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {file.category || "General"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de carga de archivos */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Archivo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload}>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="file">Seleccionar Archivo</Label>
                <Input id="file" name="file" type="file" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select name="category" defaultValue={selectedFolder || 'general'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    {FOLDER_TYPES.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Subiendo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading || uploadMutation.isPending}>
                {isUploading || uploadMutation.isPending ? "Subiendo..." : "Subir"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de vista previa de archivo */}
      <Dialog open={filePreviewOpen} onOpenChange={setFilePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            {selectedFile?.mimeType.startsWith('image/') ? (
              <div className="flex justify-center">
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name} 
                  className="max-h-[70vh] object-contain"
                />
              </div>
            ) : selectedFile?.mimeType === 'application/pdf' ? (
              <div className="h-[70vh]">
                <iframe 
                  src={selectedFile.url} 
                  className="w-full h-full"
                  title={selectedFile.name}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <File className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Vista previa no disponible</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No se puede mostrar una vista previa para este tipo de archivo ({selectedFile?.mimeType})
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleDownloadFile(selectedFile!)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setFilePreviewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}