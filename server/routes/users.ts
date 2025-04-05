import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateRequest } from "../utils";
import { insertUserSchema } from "@shared/schema";
import { hash, compare } from "bcrypt";

const router = Router();

// Obtener todos los usuarios
router.get("/", async (_req: Request, res: Response) => {
  try {
    const usersList = await storage.getUsers();
    res.json(usersList);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
});

// Obtener un usuario por ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // No enviar la contraseña
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
});

// Crear un nuevo usuario
router.post("/", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(insertUserSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: "Error de validación", errors: validation.error });
    }
    
    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await hash(validation.data.password, saltRounds);
    
    // Crear usuario con contraseña encriptada
    const userData = {
      ...validation.data,
      password: hashedPassword
    };
    
    const newUser = await storage.createUser(userData);
    
    // Registrar acción en logs de auditoría
    await storage.createAuditLog({
      userId: req.user?.id || '00000000-0000-0000-0000-000000000000', // ID del usuario que realiza la acción
      userName: req.user?.fullName || 'Sistema',
      userRole: req.user?.role || 'sistema',
      action: "create",
      entityType: "user",
      entityId: newUser.id.toString(),
      entityName: newUser.fullName || newUser.username,
      details: JSON.stringify({
        message: `Usuario ${newUser.username} creado`,
        fields: ['username', 'email', 'fullName', 'role']
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // No enviar la contraseña en la respuesta
    const { password, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear usuario", error });
  }
});

// Actualizar un usuario existente
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const existingUser = await storage.getUser(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Validar los datos de la solicitud
    const validation = validateRequest(
      insertUserSchema.partial().omit({ password: true }),
      req.body
    );
    
    if (!validation.success) {
      return res.status(400).json({ message: "Error de validación", errors: validation.error });
    }
    
    // Actualizar usuario
    const updatedUser = await storage.updateUser(id, validation.data);
    
    // Registrar acción en logs de auditoría
    const changedFields = Object.keys(validation.data);
    await storage.createAuditLog({
      userId: req.user?.id || '00000000-0000-0000-0000-000000000000',
      userName: req.user?.fullName || 'Sistema',
      userRole: req.user?.role || 'sistema',
      action: "update",
      entityType: "user",
      entityId: id.toString(),
      entityName: updatedUser.fullName || updatedUser.username,
      details: JSON.stringify({
        message: `Usuario ${updatedUser.username} actualizado`,
        changedFields
      }),
      changes: JSON.stringify({
        before: changedFields.reduce((obj, field) => {
          obj[field] = existingUser[field];
          return obj;
        }, {}),
        after: changedFields.reduce((obj, field) => {
          obj[field] = updatedUser[field];
          return obj;
        }, {})
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // No enviar la contraseña en la respuesta
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
});

// Cambiar la contraseña de un usuario
router.post("/:id/change-password", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Se requieren ambas contraseñas" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Verificar la contraseña actual
    const passwordValid = await compare(currentPassword, user.password);
    if (!passwordValid) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }
    
    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await hash(newPassword, saltRounds);
    
    // Actualizar la contraseña
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    // Registrar acción en logs de auditoría
    await storage.createAuditLog({
      userId: req.user?.id || '00000000-0000-0000-0000-000000000000',
      userName: req.user?.fullName || 'Sistema',
      userRole: req.user?.role || 'sistema',
      action: "update",
      entityType: "user",
      entityId: id.toString(),
      entityName: user.fullName || user.username,
      details: JSON.stringify({
        message: `Contraseña de usuario ${user.username} actualizada`,
        changedFields: ['password']
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: "Error al cambiar contraseña", error });
  }
});

// Eliminar un usuario
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Eliminar usuario
    const result = await storage.deleteUser(id);
    
    if (!result) {
      return res.status(500).json({ message: "Error al eliminar usuario" });
    }
    
    // Registrar acción en logs de auditoría
    await storage.createAuditLog({
      userId: req.user?.id || '00000000-0000-0000-0000-000000000000',
      userName: req.user?.fullName || 'Sistema',
      userRole: req.user?.role || 'sistema',
      action: "delete",
      entityType: "user",
      entityId: id.toString(),
      entityName: user.fullName || user.username,
      details: JSON.stringify({
        message: `Usuario ${user.username} eliminado`
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
});

export default router;