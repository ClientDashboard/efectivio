import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from '../middleware';
import { getSupabaseClient } from '../supabase';

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verificar tipos de archivo permitidos
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'));
    }
  }
});

// Obtener perfil del usuario autenticado
router.get('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Transformar el usuario a formato de perfil
    const profile = {
      id: user.id,
      name: user.fullName || user.username,
      email: user.email,
      display_name: user.displayName || user.fullName || user.username,
      avatar_url: user.profileImageUrl || null,
      created_at: user.createdAt,
      role: user.role
    };

    res.json(profile);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      message: 'Error al obtener datos de perfil', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Actualizar perfil del usuario
router.patch('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // Obtener el usuario actual
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validar los datos actualizables
    const { name, email, display_name } = req.body;
    
    // Preparar los datos a actualizar
    const updateData: any = {};
    
    if (name) updateData.fullName = name;
    if (email) updateData.email = email;
    if (display_name) updateData.displayName = display_name;
    
    // Actualizar el usuario en la base de datos
    const updatedUser = await storage.updateUser(user.id, updateData);
    
    // Transformar el usuario actualizado a formato de perfil
    const profile = {
      id: updatedUser.id,
      name: updatedUser.fullName || updatedUser.username,
      email: updatedUser.email,
      display_name: updatedUser.displayName || updatedUser.fullName || updatedUser.username,
      avatar_url: updatedUser.profileImageUrl || null,
      created_at: updatedUser.createdAt,
      role: updatedUser.role
    };

    res.json(profile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      message: 'Error al actualizar perfil',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Subir avatar
router.post('/avatar', isAuthenticated, upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
    }

    // Obtener el usuario actual
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      // Eliminar el archivo temporal si el usuario no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Leer el archivo subido
    const fileBuffer = fs.readFileSync(req.file.path);
    // Generar un nombre único para el archivo
    const fileName = `avatar_${user.id}_${uuidv4()}${path.extname(req.file.originalname)}`;
    
    // Subir a Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    // Eliminar el archivo temporal
    fs.unlinkSync(req.file.path);
    
    if (error) {
      console.error('Error al subir avatar a Supabase:', error);
      return res.status(500).json({ 
        message: 'Error al subir avatar', 
        error: error.message 
      });
    }
    
    // Obtener URL pública del avatar
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Actualizar el usuario con la nueva URL del avatar
    const updatedUser = await storage.updateUser(user.id, {
      avatar_url: publicUrl,
      profileImageUrl: publicUrl
    });
    
    res.json({ 
      success: true, 
      avatarUrl: publicUrl 
    });
  } catch (error) {
    console.error('Error al subir avatar:', error);
    
    // Asegurarse de eliminar el archivo temporal en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error al subir avatar',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;