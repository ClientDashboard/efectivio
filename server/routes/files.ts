import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { STORAGE_BUCKETS, createFilePath, uploadFile, listFiles, getSignedUrl, deleteFile } from '../supabase';
import { storage } from '../storage';
import { insertFileSchema } from '@shared/schema';
import { db } from '../db';
import { files } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

// Extender la interfaz de Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        clerkId?: string | null;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

// Configuración de multer para almacenar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite predeterminado de 10MB
  },
});

// Mapa de buckets por categoría
const bucketByCategory: Record<string, string> = {
  // Categorías originales
  'invoice': STORAGE_BUCKETS.INVOICES,
  'quote': STORAGE_BUCKETS.INVOICES, // Usamos el mismo bucket para facturas y cotizaciones
  'receipt': STORAGE_BUCKETS.RECEIPTS,
  'contract': STORAGE_BUCKETS.CONTRACTS,
  'report': STORAGE_BUCKETS.DOCUMENTS,
  'tax': STORAGE_BUCKETS.DOCUMENTS,
  'other': STORAGE_BUCKETS.DOCUMENTS,
  
  // Nuevas categorías para organización de archivos
  'client': STORAGE_BUCKETS.DOCUMENTS,
  'expense': STORAGE_BUCKETS.DOCUMENTS,
  'product': STORAGE_BUCKETS.DOCUMENTS,
  'client_document': STORAGE_BUCKETS.DOCUMENTS,
  'invoice_attachment': STORAGE_BUCKETS.INVOICES,
  'quote_attachment': STORAGE_BUCKETS.INVOICES,
  'expense_receipt': STORAGE_BUCKETS.RECEIPTS,
  'product_image': STORAGE_BUCKETS.DOCUMENTS
};

const router = Router();

// Middleware para verificar si existe el cliente
async function checkClientExists(req: any, res: any, next: any) {
  if (req.body.clientId) {
    const client = await storage.getClient(Number(req.body.clientId));
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
  }
  next();
}

// Función para registrar las rutas en una aplicación Express
export function registerFileRoutes(app: any) {
  app.use('/api/files', router);
}

// Obtener todos los archivos
router.get('/', async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Filtrar por categoría si se especifica en la query
    let fileList;
    const category = req.query.category as string;
    
    if (category) {
      // Redirigir a la ruta de categoría
      return res.redirect(`/api/files/category/${category}`);
    } else {
      // Obtener todos los archivos del usuario
      fileList = await db.select().from(files);
    }
    
    // Generar URLs firmadas para cada archivo
    const filesWithUrls = await Promise.all(
      fileList.map(async (file) => {
        const bucketName = bucketByCategory[file.category as string] || STORAGE_BUCKETS.DOCUMENTS;
        let url = file.path;
        
        // Si no es un archivo en el bucket público, generar URL firmada
        if (bucketName !== STORAGE_BUCKETS.PROFILES) {
          url = await getSignedUrl(bucketName, file.path) || file.path;
        }
        
        return {
          ...file,
          url
        };
      })
    );
    
    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
});

// Obtener todos los archivos por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    
    // Verificar si el cliente existe
    const client = await storage.getClient(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Obtener archivos de la base de datos
    const fileList = await db
      .select()
      .from(files)
      .where(eq(files.clientId, clientId));
    
    // Generar URLs firmadas para cada archivo si es necesario
    const filesWithUrls = await Promise.all(
      fileList.map(async (file) => {
        const bucketName = bucketByCategory[file.category as string] || STORAGE_BUCKETS.DOCUMENTS;
        let url = file.path;
        
        // Si no es un archivo en el bucket público, generar URL firmada
        if (bucketName !== STORAGE_BUCKETS.PROFILES) {
          url = await getSignedUrl(bucketName, file.path) || file.path;
        }
        
        return {
          ...file,
          url
        };
      })
    );
    
    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error al obtener archivos del cliente:', error);
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
});

// Subir un archivo
router.post('/upload', checkClientExists, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha enviado ningún archivo' });
    }
    
    // Datos del formulario
    let { clientId, companyId, projectId, category = 'other', folderType } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Procesar categoría según el tipo de carpeta virtual (si se proporciona)
    if (folderType) {
      // Mapear el tipo de carpeta virtual a la categoría técnica adecuada
      const folderCategoryMap: Record<string, string> = {
        'clientes': 'client_document',
        'facturas': 'invoice_attachment',
        'cotizaciones': 'quote_attachment',
        'gastos': 'expense_receipt',
        'productos': 'product_image',
      };
      
      if (folderCategoryMap[folderType]) {
        category = folderCategoryMap[folderType];
      }
    }
    
    // Determinar el bucket basado en la categoría
    const bucketName = bucketByCategory[category] || STORAGE_BUCKETS.DOCUMENTS;
    
    // Crear ruta del archivo
    const filePath = createFilePath(
      req.user.clerkId || req.user.id.toString(),
      clientId ? Number(clientId) : null,
      category,
      req.file.originalname
    );
    
    // Subir el archivo a Supabase
    const url = await uploadFile(
      bucketName,
      filePath,
      req.file.buffer,
      req.file.mimetype
    );
    
    if (!url) {
      return res.status(500).json({ error: 'Error al subir el archivo' });
    }
    
    // Guardar información del archivo en la base de datos
    const fileData = {
      name: req.file.originalname,
      path: filePath, // Guardar la ruta interna, no la URL
      size: req.file.size,
      mimeType: req.file.mimetype,
      clientId: clientId ? Number(clientId) : null,
      projectId: projectId ? Number(projectId) : null,
      companyId: companyId ? Number(companyId) : null,
      category: category,
      userId: req.user.clerkId || req.user.id.toString()
    };
    
    // Validar e insertar en la base de datos
    const validatedData = insertFileSchema.parse(fileData);
    const [fileRecord] = await db.insert(files).values(validatedData).returning();
    
    // Devolver información del archivo con URL
    res.status(201).json({
      ...fileRecord,
      url
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

// Eliminar un archivo
router.delete('/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Buscar el archivo en la base de datos
    const [fileRecord] = await db.select().from(files).where(eq(files.id, fileId));
    
    if (!fileRecord) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Verificar permisos - solo el propietario o admin puede eliminar
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (req.user.clerkId !== fileRecord.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este archivo' });
    }
    
    // Determinar el bucket basado en la categoría
    const bucketName = bucketByCategory[fileRecord.category as string] || STORAGE_BUCKETS.DOCUMENTS;
    
    // Eliminar el archivo de Supabase
    const deleted = await deleteFile(bucketName, fileRecord.path);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Error al eliminar el archivo del almacenamiento' });
    }
    
    // Eliminar el registro de la base de datos
    await db.delete(files).where(eq(files.id, fileId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

// Obtener URL firmada para un archivo
router.get('/signed-url/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const expiresIn = Number(req.query.expiresIn) || 3600; // 1 hora por defecto
    
    // Buscar el archivo en la base de datos
    const [fileRecord] = await db.select().from(files).where(eq(files.id, fileId));
    
    if (!fileRecord) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Determinar el bucket basado en la categoría
    const bucketName = bucketByCategory[fileRecord.category as string] || STORAGE_BUCKETS.DOCUMENTS;
    
    // Generar URL firmada
    const signedUrl = await getSignedUrl(bucketName, fileRecord.path, expiresIn);
    
    if (!signedUrl) {
      return res.status(500).json({ error: 'Error al generar la URL firmada' });
    }
    
    res.json({ signedUrl });
  } catch (error) {
    console.error('Error al generar URL firmada:', error);
    res.status(500).json({ error: 'Error al generar la URL firmada' });
  }
});

// Obtener archivos por categoría (para organización en carpetas)
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const validCategories: Record<string, string> = {
      'clientes': 'client',
      'facturas': 'invoice',
      'cotizaciones': 'quote',
      'gastos': 'expense',
      'productos': 'product',
    };
    
    // Verificar si es una categoría virtual válida
    if (!validCategories[category] && !Object.values(validCategories).includes(category)) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }
    
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Mapear la categoría virtual a la categoría real o usar la categoría directamente
    const dbCategory = validCategories[category] || category;
    
    // Determinar los tipos de categoría para la búsqueda:
    // Por ejemplo, para 'facturas' queremos 'invoice' y 'invoice_attachment'
    let categoriesToSearch = [dbCategory];
    
    if (dbCategory === 'client') {
      categoriesToSearch.push('client_document');
    } else if (dbCategory === 'invoice') {
      categoriesToSearch.push('invoice_attachment');
    } else if (dbCategory === 'quote') {
      categoriesToSearch.push('quote_attachment');
    } else if (dbCategory === 'expense') {
      categoriesToSearch.push('expense_receipt');
    } else if (dbCategory === 'product') {
      categoriesToSearch.push('product_image');
    }
    
    // Obtener archivos de la base de datos por categoría
    // Como no podemos usar inArray directamente con el enum, usamos operador OR
    let whereConditions = [];
    
    for (const category of categoriesToSearch) {
      whereConditions.push(eq(files.category, category as any));
    }
    
    const fileList = await db
      .select()
      .from(files)
      .where(or(...whereConditions));
    
    // Generar URLs firmadas para cada archivo
    const filesWithUrls = await Promise.all(
      fileList.map(async (file) => {
        const bucketName = bucketByCategory[file.category as string] || STORAGE_BUCKETS.DOCUMENTS;
        let url = file.path;
        
        // Si no es un archivo en el bucket público, generar URL firmada
        if (bucketName !== STORAGE_BUCKETS.PROFILES) {
          url = await getSignedUrl(bucketName, file.path) || file.path;
        }
        
        return {
          ...file,
          url
        };
      })
    );
    
    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error al obtener archivos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
});

// Obtener categorías disponibles (carpetas del sistema de almacenamiento)
router.get('/categories', async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Lista de categorías/carpetas disponibles con sus nombres en español
    const categories = [
      { id: 'clientes', name: 'Clientes', icon: 'users' },
      { id: 'facturas', name: 'Facturas', icon: 'file-text' },
      { id: 'cotizaciones', name: 'Cotizaciones', icon: 'file' },
      { id: 'gastos', name: 'Gastos', icon: 'credit-card' },
      { id: 'productos', name: 'Productos', icon: 'package' }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

export default router;