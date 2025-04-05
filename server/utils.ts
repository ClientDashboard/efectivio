import { Request } from "express";
import { storage } from "./storage";

/**
 * Obtiene el ID del usuario actual a partir de la sesión
 * @param req Request de Express
 * @returns ID del usuario o null si no hay sesión
 */
export function getCurrentUserId(req: Request): string | null {
  return req.user?.id?.toString() || null;
}

/**
 * Obtiene el nombre de usuario actual a partir de la sesión
 * @param req Request de Express
 * @returns Nombre del usuario o null si no hay sesión
 */
export function getCurrentUsername(req: Request): string | null {
  return req.user?.username || null;
}

/**
 * Obtiene el rol del usuario actual a partir de la sesión
 * @param req Request de Express
 * @returns Rol del usuario o null si no hay sesión
 */
export function getCurrentUserRole(req: Request): string | null {
  return req.user?.role || null;
}

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param req Request de Express
 * @param roles Array de roles permitidos
 * @returns true si el usuario tiene alguno de los roles especificados
 */
export function hasRole(req: Request, roles: string[]): boolean {
  const userRole = getCurrentUserRole(req);
  return userRole !== null && roles.includes(userRole);
}

/**
 * Verifica si el usuario actual es un administrador
 * @param req Request de Express
 * @returns true si el usuario es administrador
 */
export function isAdmin(req: Request): boolean {
  return hasRole(req, ["administrador_sistema"]);
}

/**
 * Registra una acción en el log de auditoría
 * @param req Request de Express
 * @param action Tipo de acción realizada
 * @param entity Entidad afectada
 * @param entityId ID de la entidad afectada
 * @param details Detalles adicionales
 * @param prevData Datos previos (para cambios)
 * @param newData Nuevos datos (para cambios)
 */
export async function logAuditAction(
  req: Request,
  action: string,
  entity: string,
  entityId?: number | string,
  details?: string,
  prevData?: any,
  newData?: any
) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return;

    const userName = getCurrentUsername(req);
    const userRole = getCurrentUserRole(req);
    
    let changes = null;
    if (prevData && newData) {
      changes = JSON.stringify({
        previous: prevData,
        new: newData
      });
    }

    await storage.createAuditLog({
      userId,
      userName,
      userRole,
      action: action as any,
      entity: entity as any,
      entityId: entityId?.toString(),
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
      changes
    });
  } catch (error) {
    console.error("Error al registrar acción de auditoría:", error);
  }
}