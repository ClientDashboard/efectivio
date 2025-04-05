import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { systemConfig, whiteLabel } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateRequest, createAuditLog } from "../utils";
import { z } from "zod";

// Extender la interfaz Request para incluir isAuthenticated
import { Request as ExpressRequest } from "express";
interface Request extends ExpressRequest {
  isAuthenticated(): boolean;
}

const router = Router();

// Middleware para verificar si el usuario es administrador
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.user.role !== "administrador_sistema") {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador" });
  }

  next();
};

// Obtener todas las configuraciones del sistema
router.get("/settings", async (req: Request, res: Response) => {
  try {
    // Retornar configuraciones de ejemplo para pruebas (sin autenticación)
    const mockConfigs = [
      {
        id: 1,
        key: "company_name",
        value: "Efectivio",
        category: "general",
        description: "Nombre de la empresa",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        key: "currency",
        value: "USD",
        category: "finance",
        description: "Moneda predeterminada",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json(mockConfigs);
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    res.status(500).json({ message: "Error al obtener configuraciones", error });
  }
});

// Obtener configuraciones por categoría
router.get("/settings/category/:category", async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const configs = await storage.getSystemConfigsByCategory(category);
    res.json(configs);
  } catch (error) {
    console.error("Error al obtener configuraciones por categoría:", error);
    res.status(500).json({ message: "Error al obtener configuraciones por categoría", error });
  }
});

// Obtener una configuración específica por clave
router.get("/settings/:key", async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    const config = await storage.getSystemConfig(key);
    
    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ message: "Error al obtener configuración", error });
  }
});

// Esquema para validar configuraciones del sistema
const systemConfigSchema = z.object({
  key: z.string().min(1, "La clave es requerida"),
  value: z.string().min(1, "El valor es requerido"),
  description: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida")
});

// Crear una nueva configuración del sistema
router.post("/settings", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const validation = validateRequest(systemConfigSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: "Datos de configuración inválidos", errors: validation.error });
    }
    
    // Verificar si la clave ya existe
    const existingConfig = await storage.getSystemConfig(validation.data.key);
    
    if (existingConfig) {
      return res.status(409).json({ message: "Ya existe una configuración con esta clave" });
    }
    
    // Crear la configuración
    const newConfig = await storage.createSystemConfig(validation.data);
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "create",
      entityType: "system_config",
      entityId: newConfig.key,
      entityName: newConfig.key,
      details: JSON.stringify({
        message: `Configuración "${newConfig.key}" creada`,
        category: newConfig.category
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error("Error al crear configuración:", error);
    res.status(500).json({ message: "Error al crear configuración", error });
  }
});

// Actualizar una configuración existente
router.put("/settings/:key", requireAdmin, async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    
    // Verificar si la configuración existe
    const existingConfig = await storage.getSystemConfig(key);
    
    if (!existingConfig) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }
    
    // Validar datos de entrada
    const validation = validateRequest(systemConfigSchema.partial(), req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: "Datos de configuración inválidos", errors: validation.error });
    }
    
    // Actualizar la configuración
    const updatedConfig = await storage.updateSystemConfig(key, validation.data);
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "update",
      entityType: "system_config",
      entityId: key,
      entityName: key,
      details: JSON.stringify({
        message: `Configuración "${key}" actualizada`,
        changedFields: Object.keys(validation.data)
      }),
      changes: JSON.stringify({
        previous: existingConfig,
        new: updatedConfig
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ message: "Error al actualizar configuración", error });
  }
});

// Eliminar una configuración del sistema
router.delete("/settings/:key", requireAdmin, async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    
    // Verificar si la configuración existe
    const existingConfig = await storage.getSystemConfig(key);
    
    if (!existingConfig) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }
    
    // Eliminar la configuración
    const success = await storage.deleteSystemConfig(key);
    
    if (!success) {
      return res.status(500).json({ message: "Error al eliminar configuración" });
    }
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "delete",
      entityType: "system_config",
      entityId: key,
      entityName: key,
      details: JSON.stringify({
        message: `Configuración "${key}" eliminada`,
        category: existingConfig.category
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.json({ message: "Configuración eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar configuración:", error);
    res.status(500).json({ message: "Error al eliminar configuración", error });
  }
});

// Obtener todas las configuraciones de marca blanca
router.get("/white-label", async (req: Request, res: Response) => {
  try {
    // Retornar datos de ejemplo para pruebas (sin autenticación)
    const mockWhiteLabelConfigs = [
      {
        id: 1,
        companyName: "Efectivio",
        domain: "efectivio.com",
        primaryColor: "#007bff",
        logoUrl: null,
        faviconUrl: null,
        footerText: "© 2025 Efectivio - Todos los derechos reservados",
        enablePoweredBy: true,
        isActive: true,
        clientId: null,
        contactEmail: "info@efectivio.com",
        contactPhone: "+1234567890",
        additionalCss: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json(mockWhiteLabelConfigs);
  } catch (error) {
    console.error("Error al obtener configuraciones de marca blanca:", error);
    res.status(500).json({ message: "Error al obtener configuraciones de marca blanca", error });
  }
});

// Obtener la configuración activa de marca blanca
router.get("/white-label/active", async (req: Request, res: Response) => {
  try {
    // Retornar datos de ejemplo para pruebas (sin autenticación)
    const mockActiveConfig = {
      id: 1,
      companyName: "Efectivio",
      domain: "efectivio.com",
      primaryColor: "#007bff",
      logoUrl: null,
      faviconUrl: null,
      footerText: "© 2025 Efectivio - Todos los derechos reservados",
      enablePoweredBy: true,
      isActive: true,
      clientId: null,
      contactEmail: "info@efectivio.com",
      contactPhone: "+1234567890",
      additionalCss: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json(mockActiveConfig);
  } catch (error) {
    console.error("Error al obtener configuración de marca blanca activa:", error);
    res.status(500).json({ message: "Error al obtener configuración de marca blanca activa", error });
  }
});

// Obtener configuración de marca blanca para un cliente específico
router.get("/white-label/client/:clientId", async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ message: "ID de cliente inválido" });
    }
    
    // Si es una solicitud autenticada, verificar permisos
    if (req.isAuthenticated()) {
      // El usuario solo puede acceder a su propia configuración, a menos que sea administrador
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "administrador_sistema";
      
      if (!isAdmin && userId && userId.toString() !== clientId.toString()) {
        return res.status(403).json({ message: "No tiene permisos para acceder a esta configuración" });
      }
    }
    
    const config = await storage.getWhiteLabelByClient(clientId);
    
    if (!config) {
      return res.status(404).json({ message: "Configuración de marca blanca no encontrada para este cliente" });
    }
    
    // Formatear las fechas
    const formattedConfig = {
      ...config,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString()
    };
    
    res.json(formattedConfig);
  } catch (error) {
    console.error("Error al obtener configuración por cliente:", error);
    res.status(500).json({ message: "Error al obtener configuración por cliente", error });
  }
});

// Obtener una configuración específica de marca blanca
router.get("/white-label/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de configuración inválido" });
    }
    
    // Si es una solicitud autenticada, verificar permisos
    if (req.isAuthenticated()) {
      // Solo los administradores pueden acceder a configuraciones específicas por ID
      const isAdmin = req.user?.role === "administrador_sistema";
      
      if (!isAdmin) {
        return res.status(403).json({ message: "No tiene permisos para acceder a esta configuración" });
      }
    }
    
    const config = await storage.getWhiteLabel(id);
    
    if (!config) {
      return res.status(404).json({ message: "Configuración de marca blanca no encontrada" });
    }
    
    // Formatear las fechas
    const formattedConfig = {
      ...config,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString()
    };
    
    res.json(formattedConfig);
  } catch (error) {
    console.error("Error al obtener configuración de marca blanca:", error);
    res.status(500).json({ message: "Error al obtener configuración de marca blanca", error });
  }
});

// Esquema para validar configuraciones de marca blanca
const whiteLabelSchema = z.object({
  id: z.number().optional(),
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  domain: z.string().min(1, "El dominio es requerido"),
  primaryColor: z.string().min(1, "El color primario es requerido"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  footerText: z.string().optional(),
  enablePoweredBy: z.boolean().default(true),
  isActive: z.boolean().default(false),
  clientId: z.number().nullable().optional(),
  contactEmail: z.string().email("Debe ser un email válido").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  additionalCss: z.string().optional(),
});

// Crear una nueva configuración de marca blanca
router.post("/white-label", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const validation = validateRequest(whiteLabelSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: "Datos de configuración inválidos", errors: validation.error });
    }
    
    // Crear la configuración
    const newConfig = await storage.createWhiteLabel(validation.data);
    
    // Si se marcó como activa, desactivar las demás
    if (validation.data.isActive) {
      const allConfigs = await storage.getWhiteLabels();
      
      for (const config of allConfigs) {
        if (config.id !== newConfig.id && config.isActive) {
          await storage.updateWhiteLabel(config.id, { isActive: false });
        }
      }
    }
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "create",
      entityType: "white_label",
      entityId: newConfig.id.toString(),
      entityName: newConfig.companyName,
      details: JSON.stringify({
        message: `Configuración de marca blanca para "${newConfig.companyName}" creada`,
        domain: newConfig.domain,
        isActive: newConfig.isActive
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error("Error al crear configuración de marca blanca:", error);
    res.status(500).json({ message: "Error al crear configuración de marca blanca", error });
  }
});

// Actualizar una configuración de marca blanca existente
router.put("/white-label/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de configuración inválido" });
    }
    
    // Verificar si la configuración existe
    const existingConfig = await storage.getWhiteLabel(id);
    
    if (!existingConfig) {
      return res.status(404).json({ message: "Configuración de marca blanca no encontrada" });
    }
    
    // Validar datos de entrada
    const validation = validateRequest(whiteLabelSchema.partial(), req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: "Datos de configuración inválidos", errors: validation.error });
    }
    
    // Actualizar la configuración
    const updatedConfig = await storage.updateWhiteLabel(id, validation.data);
    
    // Si se marcó como activa, desactivar las demás
    if (validation.data.isActive && validation.data.isActive !== existingConfig.isActive) {
      const allConfigs = await storage.getWhiteLabels();
      
      for (const config of allConfigs) {
        if (config.id !== id && config.isActive) {
          await storage.updateWhiteLabel(config.id, { isActive: false });
        }
      }
    }
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "update",
      entityType: "white_label",
      entityId: id.toString(),
      entityName: updatedConfig.companyName,
      details: JSON.stringify({
        message: `Configuración de marca blanca para "${updatedConfig.companyName}" actualizada`,
        changedFields: Object.keys(validation.data)
      }),
      changes: JSON.stringify({
        previous: existingConfig,
        new: updatedConfig
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error al actualizar configuración de marca blanca:", error);
    res.status(500).json({ message: "Error al actualizar configuración de marca blanca", error });
  }
});

// Eliminar una configuración de marca blanca
router.delete("/white-label/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de configuración inválido" });
    }
    
    // Verificar si la configuración existe
    const existingConfig = await storage.getWhiteLabel(id);
    
    if (!existingConfig) {
      return res.status(404).json({ message: "Configuración de marca blanca no encontrada" });
    }
    
    // No permitir eliminar configuraciones activas
    if (existingConfig.isActive) {
      return res.status(400).json({ message: "No se puede eliminar una configuración activa. Desactívela primero." });
    }
    
    // Eliminar la configuración
    const success = await storage.deleteWhiteLabel(id);
    
    if (!success) {
      return res.status(500).json({ message: "Error al eliminar configuración de marca blanca" });
    }
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "delete",
      entityType: "white_label",
      entityId: id.toString(),
      entityName: existingConfig.companyName,
      details: JSON.stringify({
        message: `Configuración de marca blanca para "${existingConfig.companyName}" eliminada`,
        domain: existingConfig.domain
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.json({ message: "Configuración de marca blanca eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar configuración de marca blanca:", error);
    res.status(500).json({ message: "Error al eliminar configuración de marca blanca", error });
  }
});

// Activar una configuración de marca blanca específica
router.put("/white-label/:id/activate", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de configuración inválido" });
    }
    
    // Verificar si la configuración existe
    const config = await storage.getWhiteLabel(id);
    
    if (!config) {
      return res.status(404).json({ message: "Configuración de marca blanca no encontrada" });
    }
    
    // Si ya está activa, no hacer nada
    if (config.isActive) {
      return res.json({ message: "La configuración ya está activa", config });
    }
    
    // Desactivar todas las configuraciones
    const allConfigs = await storage.getWhiteLabels();
    
    for (const existingConfig of allConfigs) {
      if (existingConfig.isActive) {
        await storage.updateWhiteLabel(existingConfig.id, { isActive: false });
      }
    }
    
    // Activar la configuración seleccionada
    const updatedConfig = await storage.updateWhiteLabel(id, { isActive: true });
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "update",
      entityType: "white_label",
      entityId: id.toString(),
      entityName: config.companyName,
      details: JSON.stringify({
        message: `Configuración de marca blanca para "${config.companyName}" activada`,
        domain: config.domain
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.json({ message: "Configuración de marca blanca activada correctamente", config: updatedConfig });
  } catch (error) {
    console.error("Error al activar configuración de marca blanca:", error);
    res.status(500).json({ message: "Error al activar configuración de marca blanca", error });
  }
});

// Desactivar todas las configuraciones de marca blanca
router.put("/white-label/deactivate-all", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Obtener todas las configuraciones
    const allConfigs = await storage.getWhiteLabels();
    
    // Desactivar todas las configuraciones activas
    for (const config of allConfigs) {
      if (config.isActive) {
        await storage.updateWhiteLabel(config.id, { isActive: false });
      }
    }
    
    // Registrar acción en log de auditoría
    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      userRole: req.user?.role,
      action: "update",
      entityType: "white_label",
      entityId: "all",
      entityName: "all",
      details: JSON.stringify({
        message: "Todas las configuraciones de marca blanca han sido desactivadas"
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.json({ message: "Todas las configuraciones de marca blanca han sido desactivadas" });
  } catch (error) {
    console.error("Error al desactivar configuraciones de marca blanca:", error);
    res.status(500).json({ message: "Error al desactivar configuraciones de marca blanca", error });
  }
});

export default router;