import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar si el usuario está autenticado
 * Dependiendo del entorno, esta función puede simplemente pasar al siguiente middleware
 * (para desarrollo) o verificar realmente la autenticación (producción)
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // En modo desarrollo, permitimos el acceso para pruebas
  if (process.env.NODE_ENV === 'development') {
    // Si req.user no existe, creamos un usuario falso para desarrollo
    if (!req.user) {
      req.user = {
        id: 1,
        username: 'admin',
        email: 'admin@ejemplo.com',
        fullName: 'Administrador Desarrollo'
      };
    }
    return next();
  }
  
  // En producción, verificamos la autenticación real
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Si no hay autenticación, devolver error 401
  return res.status(401).json({ message: 'No autenticado' });
}

/**
 * Middleware para verificar si el usuario tiene un rol específico
 * @param roles Array de roles permitidos
 */
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // En modo desarrollo, permitimos el acceso para pruebas
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    // Verificar si el usuario está autenticado
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    // Verificar si el usuario tiene el rol requerido
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    return next();
  };
}

// Añadimos la definición de tipos para extender Express Request
declare global {
  namespace Express {
    interface User {
      id: number;
      username?: string;
      email: string;
      fullName?: string;
      role?: string;
      [key: string]: any;
    }
  }
}