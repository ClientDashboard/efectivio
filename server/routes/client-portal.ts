import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendClientPortalInvitation } from '../email';
import { storage } from '../storage';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Validador para la invitación
const invitationSchema = z.object({
  clientId: z.number(),
  email: z.string().email(),
  expiryDays: z.number().int().positive(),
  message: z.string().optional(),
});

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Envía una invitación al portal del cliente
 */
router.post('/invite', async (req: Request, res: Response) => {
  try {
    // Validar datos
    const validatedData = invitationSchema.parse(req.body);
    
    // Verificar que el cliente existe
    const client = await storage.getClient(validatedData.clientId);
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }
    
    // Generar token único
    const token = randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validatedData.expiryDays);
    
    // Guardar invitación en la base de datos
    const { data, error } = await supabase
      .from('client_invitations')
      .insert([
        {
          client_id: validatedData.clientId,
          email: validatedData.email,
          token: token,
          expires_at: expiryDate.toISOString(),
          message: validatedData.message,
          status: 'pendiente'
        }
      ])
      .select();
    
    if (error) {
      console.error('Error al guardar invitación:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al guardar la invitación' 
      });
    }
    
    // Enviar email
    const emailSent = await sendClientPortalInvitation(
      validatedData.email,
      client.displayName || client.companyName || 'Cliente',
      token,
      expiryDate
    );
    
    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error al enviar el email de invitación' 
      });
    }
    
    // Actualizar cliente con acceso al portal habilitado
    await storage.updateClient(validatedData.clientId, { hasPortalAccess: true });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Invitación enviada correctamente',
      data: {
        invitation: data?.[0],
        expires: expiryDate
      }
    });
    
  } catch (error) {
    console.error('Error en la invitación al portal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de invitación inválidos',
        errors: error.errors 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la invitación' 
    });
  }
});

/**
 * Verifica un token de invitación
 */
router.get('/verify-token/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Buscar token en la base de datos
    const { data, error } = await supabase
      .from('client_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendiente')
      .single();
    
    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Token de invitación inválido o expirado' 
      });
    }
    
    // Verificar si ha expirado
    const expiryDate = new Date(data.expires_at);
    if (expiryDate < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'El token de invitación ha expirado' 
      });
    }
    
    // Obtener datos del cliente
    const client = await storage.getClient(data.client_id);
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: {
        clientId: client.id,
        email: data.email,
        clientName: client.displayName || client.companyName,
        expiryDate: expiryDate
      }
    });
    
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar el token de invitación' 
    });
  }
});

/**
 * Registra un cliente en el portal usando el token de invitación
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { token, password, name } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token y contraseña son requeridos' 
      });
    }
    
    // Buscar token en la base de datos
    const { data: invitationData, error: invitationError } = await supabase
      .from('client_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendiente')
      .single();
    
    if (invitationError || !invitationData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Token de invitación inválido o expirado' 
      });
    }
    
    // Verificar si ha expirado
    const expiryDate = new Date(invitationData.expires_at);
    if (expiryDate < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'El token de invitación ha expirado' 
      });
    }
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitationData.email,
      password: password,
      email_confirm: true,
      user_metadata: { 
        client_id: invitationData.client_id,
        name: name || invitationData.email
      }
    });
    
    if (authError) {
      console.error('Error al crear usuario:', authError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al crear cuenta de usuario' 
      });
    }
    
    // Actualizar invitación como completada
    await supabase
      .from('client_invitations')
      .update({ 
        status: 'completada',
        completed_at: new Date().toISOString()
      })
      .eq('token', token);
    
    // Asociar usuario con cliente en la base de datos
    const { error: portalUserError } = await supabase
      .from('client_portal_users')
      .insert([{
        client_id: invitationData.client_id,
        user_id: authData.user.id,
        email: invitationData.email,
        access_level: 'cliente'
      }]);
    
    if (portalUserError) {
      console.error('Error al asociar usuario con cliente:', portalUserError);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Registro completado correctamente',
      data: {
        email: invitationData.email,
        clientId: invitationData.client_id
      }
    });
    
  } catch (error) {
    console.error('Error en el registro del portal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el registro' 
    });
  }
});

export default router;