import { Router } from "express";
import { db } from "../db";
import { systemConfig, whiteLabel, insertSystemConfigSchema, insertWhiteLabelSchema } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { storage } from "../storage";
import { randomBytes } from "crypto";
import { createAuditLog } from "../utils";

const router = Router();

// Middleware para verificar permisos de administrador
const requireAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  // Verificar si el usuario tiene rol de administrador
  if (req.user?.role !== "administrador_sistema") {
    return res.status(403).json({ error: "No autorizado" });
  }
  
  next();
};

// Obtener todas las configuraciones del sistema
router.get("/settings", async (req, res) => {
  try {
    const configs = await storage.getSystemConfigs();
    res.json(configs);
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    res.status(500).json({ error: "Error al obtener configuraciones" });
  }
});

// Obtener configuraciones por categoría
router.get("/settings/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const configs = await storage.getSystemConfigsByCategory(category);
    res.json(configs);
  } catch (error) {
    console.error("Error al obtener configuraciones por categoría:", error);
    res.status(500).json({ error: "Error al obtener configuraciones por categoría" });
  }
});

// Obtener una configuración específica
router.get("/settings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const config = await storage.getSystemConfig(id);
    
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// Obtener configuración por clave
router.get("/settings/key/:key", async (req, res) => {
  try {
    const { key } = req.params;
    
    // Buscar por clave
    const [config] = await db.select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key));
    
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // Si la configuración no está activa, verificar si el usuario es administrador
    if (!config.isActive && req.user?.role !== "administrador_sistema") {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración por clave:", error);
    res.status(500).json({ error: "Error al obtener configuración por clave" });
  }
});

// Crear una nueva configuración
router.post("/settings", requireAdmin, async (req, res) => {
  try {
    // Validar el cuerpo de la solicitud
    const validatedData = insertSystemConfigSchema.parse(req.body);
    
    // Verificar si ya existe una configuración con la misma clave
    const existing = await storage.getSystemConfig(0, validatedData.key);
    if (existing) {
      return res.status(400).json({ error: "Ya existe una configuración con esa clave" });
    }
    
    // Crear la configuración
    const newConfig = await storage.createSystemConfig(validatedData);
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "create",
      entity: "setting",
      entityId: newConfig.id.toString(),
      details: `Creó la configuración ${newConfig.key}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error("Error al crear configuración:", error);
    res.status(400).json({ error: error.message || "Error al crear configuración" });
  }
});

// Actualizar una configuración existente
router.put("/settings/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Buscar la configuración
    const config = await storage.getSystemConfig(id);
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // Validar los datos
    const validatedData = insertSystemConfigSchema.parse(req.body);
    
    // Actualizar la configuración
    const updatedConfig = await storage.updateSystemConfig(id, validatedData);
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "update",
      entity: "setting",
      entityId: id.toString(),
      details: `Actualizó la configuración ${config.key}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(400).json({ error: error.message || "Error al actualizar configuración" });
  }
});

// Eliminar una configuración
router.delete("/settings/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Buscar la configuración
    const config = await storage.getSystemConfig(id);
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // No permitir eliminar configuraciones requeridas
    if (config.isRequired) {
      return res.status(400).json({ error: "No se puede eliminar una configuración requerida por el sistema" });
    }
    
    // Eliminar la configuración
    await storage.deleteSystemConfig(id);
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "delete",
      entity: "setting",
      entityId: id.toString(),
      details: `Eliminó la configuración ${config.key}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar configuración:", error);
    res.status(500).json({ error: "Error al eliminar configuración" });
  }
});

// RUTAS PARA WHITE LABEL

// Obtener todas las configuraciones de white label (solo admin)
router.get("/white-label", requireAdmin, async (req, res) => {
  try {
    const configs = await storage.getWhiteLabels();
    
    // Añadir información del cliente
    const configsWithClientData = await Promise.all(
      configs.map(async (config) => {
        if (config.clientId) {
          // Obtener información del cliente
          const [client] = await db.select({ name: sql`name` })
            .from(sql`clients`)
            .where(sql`id = ${config.clientId}`);
          
          return {
            ...config,
            clientName: client ? client.name : null
          };
        }
        return config;
      })
    );
    
    res.json(configsWithClientData);
  } catch (error) {
    console.error("Error al obtener configuraciones de white label:", error);
    res.status(500).json({ error: "Error al obtener configuraciones de white label" });
  }
});

// Obtener la configuración white label activa
router.get("/white-label/active", async (req, res) => {
  try {
    const config = await storage.getActiveWhiteLabel();
    
    if (!config) {
      return res.status(404).json({ error: "No hay configuración activa" });
    }
    
    // Añadir información del cliente si corresponde
    if (config.clientId) {
      const [client] = await db.select({ name: sql`name` })
        .from(sql`clients`)
        .where(sql`id = ${config.clientId}`);
      
      if (client) {
        config.clientName = client.name;
      }
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración white label activa:", error);
    res.status(500).json({ error: "Error al obtener configuración white label activa" });
  }
});

// Obtener la configuración white label para un cliente específico
router.get("/white-label/client/:clientId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    // Verificar permisos
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    // Si no es admin, verificar que el usuario tenga acceso a este cliente
    if (req.user.role !== "administrador_sistema") {
      // Aquí podríamos añadir lógica para verificar si este usuario puede acceder a este cliente
    }
    
    // Obtener configuración white label para el cliente
    const config = await storage.getWhiteLabelByClient(clientId);
    
    if (!config) {
      return res.status(404).json({ error: "No hay configuración para este cliente" });
    }
    
    // Añadir información del cliente
    const [client] = await db.select({ name: sql`name` })
      .from(sql`clients`)
      .where(sql`id = ${clientId}`);
    
    if (client) {
      config.clientName = client.name;
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración white label para cliente:", error);
    res.status(500).json({ error: "Error al obtener configuración white label para cliente" });
  }
});

// Obtener una configuración white label específica
router.get("/white-label/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar permisos
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    // Obtener la configuración
    const config = await storage.getWhiteLabel(id);
    
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // Si no es admin, verificar que tenga acceso a la configuración
    if (req.user.role !== "administrador_sistema") {
      // Si la configuración está asociada a un cliente, verificar que el usuario tenga acceso a ese cliente
      if (config.clientId) {
        // Aquí podríamos añadir lógica para verificar si este usuario puede acceder a este cliente
      }
    }
    
    // Añadir información del cliente si corresponde
    if (config.clientId) {
      const [client] = await db.select({ name: sql`name` })
        .from(sql`clients`)
        .where(sql`id = ${config.clientId}`);
      
      if (client) {
        config.clientName = client.name;
      }
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración white label:", error);
    res.status(500).json({ error: "Error al obtener configuración white label" });
  }
});

// Crear una nueva configuración white label
router.post("/white-label", requireAdmin, async (req, res) => {
  try {
    // Validar el cuerpo de la solicitud
    const validatedData = insertWhiteLabelSchema.parse(req.body);
    
    // Crear la configuración
    const newConfig = await storage.createWhiteLabel(validatedData);
    
    // Si se marca como activa, desactivar las demás
    if (newConfig.isActive) {
      // Obtener todas las configuraciones
      const allConfigs = await storage.getWhiteLabels();
      
      // Desactivar todas excepto la nueva
      for (const config of allConfigs) {
        if (config.id !== newConfig.id && config.isActive) {
          await storage.updateWhiteLabel(config.id, { ...config, isActive: false });
        }
      }
    }
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "create",
      entity: "white_label",
      entityId: newConfig.id.toString(),
      details: `Creó la configuración de marca blanca ${newConfig.name}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error("Error al crear configuración white label:", error);
    res.status(400).json({ error: error.message || "Error al crear configuración white label" });
  }
});

// Actualizar una configuración white label
router.put("/white-label/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Buscar la configuración
    const config = await storage.getWhiteLabel(id);
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // Validar los datos
    const validatedData = insertWhiteLabelSchema.parse(req.body);
    
    // Actualizar la configuración
    const updatedConfig = await storage.updateWhiteLabel(id, validatedData);
    
    // Si se marca como activa, desactivar las demás
    if (updatedConfig.isActive) {
      // Obtener todas las configuraciones
      const allConfigs = await storage.getWhiteLabels();
      
      // Desactivar todas excepto la actualizada
      for (const config of allConfigs) {
        if (config.id !== id && config.isActive) {
          await storage.updateWhiteLabel(config.id, { ...config, isActive: false });
        }
      }
    }
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "update",
      entity: "white_label",
      entityId: id.toString(),
      details: `Actualizó la configuración de marca blanca ${config.name}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error al actualizar configuración white label:", error);
    res.status(400).json({ error: error.message || "Error al actualizar configuración white label" });
  }
});

// Eliminar una configuración white label
router.delete("/white-label/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Buscar la configuración
    const config = await storage.getWhiteLabel(id);
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // Verificar si está activa
    if (config.isActive) {
      return res.status(400).json({ 
        error: "No se puede eliminar una configuración activa. Desactive la configuración primero." 
      });
    }
    
    // Eliminar la configuración
    await storage.deleteWhiteLabel(id);
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "delete",
      entity: "white_label",
      entityId: id.toString(),
      details: `Eliminó la configuración de marca blanca ${config.name}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar configuración white label:", error);
    res.status(500).json({ error: "Error al eliminar configuración white label" });
  }
});

// Activar una configuración white label
router.put("/white-label/:id/activate", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Buscar la configuración
    const config = await storage.getWhiteLabel(id);
    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    
    // Si ya está activa, no hacer nada
    if (config.isActive) {
      return res.json(config);
    }
    
    // Obtener todas las configuraciones
    const allConfigs = await storage.getWhiteLabels();
    
    // Desactivar todas
    for (const c of allConfigs) {
      if (c.isActive) {
        await storage.updateWhiteLabel(c.id, { ...c, isActive: false });
      }
    }
    
    // Activar la seleccionada
    const updatedConfig = await storage.updateWhiteLabel(id, { ...config, isActive: true });
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "update",
      entity: "white_label",
      entityId: id.toString(),
      details: `Activó la configuración de marca blanca ${config.name}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error al activar configuración white label:", error);
    res.status(500).json({ error: "Error al activar configuración white label" });
  }
});

// Desactivar todas las configuraciones white label
router.put("/white-label/deactivate-all", requireAdmin, async (req, res) => {
  try {
    // Obtener todas las configuraciones
    const allConfigs = await storage.getWhiteLabels();
    
    // Desactivar todas
    for (const config of allConfigs) {
      if (config.isActive) {
        await storage.updateWhiteLabel(config.id, { ...config, isActive: false });
      }
    }
    
    // Registrar la acción en el log de auditoría
    await createAuditLog({
      userId: req.user.id.toString(),
      userName: req.user.fullName || req.user.username,
      userRole: req.user.role,
      action: "update",
      entity: "white_label",
      entityId: "all",
      details: "Desactivó todas las configuraciones de marca blanca",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error al desactivar todas las configuraciones white label:", error);
    res.status(500).json({ error: "Error al desactivar todas las configuraciones white label" });
  }
});

export default router;