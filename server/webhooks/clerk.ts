import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Tipos para eventos de webhook de Clerk
interface WebhookEvent {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
      verification: {
        status: string;
      }
    }>;
    username?: string;
    first_name?: string;
    last_name?: string;
    password_enabled: boolean;
    created_at: number;
    updated_at: number;
  };
  object: string;
  type: string;
}

/**
 * Procesa eventos de webhook de Clerk
 * Esta función recibe eventos de Clerk (creación, actualización, eliminación de usuario)
 * y sincroniza los usuarios en nuestra base de datos de Supabase
 */
export async function handleClerkWebhook(req: Request, res: Response) {
  // Verificar la firma del webhook para asegurarnos que viene de Clerk
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error("Falta la clave secreta del webhook de Clerk");
    return res.status(500).json({ error: "Error de configuración del servidor" });
  }

  // Obtener la cabecera de la firma del webhook
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  // Si alguna de las cabeceras falta, regresamos un error
  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: "Faltan cabeceras de webhook" });
  }

  // Verificar la firma
  let payload: WebhookEvent;
  
  try {
    const webhook = new Webhook(WEBHOOK_SECRET);
    payload = webhook.verify(
      JSON.stringify(req.body),
      {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }
    ) as WebhookEvent;
  } catch (err) {
    console.error("Error al verificar la firma del webhook:", err);
    return res.status(400).json({ error: "Firma de webhook inválida" });
  }

  // Procesar el evento según su tipo
  const eventType = payload.type;
  
  try {
    if (eventType === "user.created") {
      await handleUserCreated(payload.data);
    } else if (eventType === "user.updated") {
      await handleUserUpdated(payload.data);
    } else if (eventType === "user.deleted") {
      await handleUserDeleted(payload.data);
    }
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Error al procesar evento ${eventType}:`, err);
    return res.status(500).json({ error: "Error al procesar el evento" });
  }
}

/**
 * Maneja el evento de creación de usuario de Clerk
 */
async function handleUserCreated(userData: WebhookEvent['data']) {
  const email = userData.email_addresses[0]?.email_address;
  const username = userData.username || email?.split('@')[0] || `user_${userData.id}`;
  
  // Verificar si el usuario ya existe en nuestra base de datos
  const [existingUser] = await db.select()
    .from(users)
    .where(eq(users.clerkId, userData.id))
    .limit(1);
  
  if (existingUser) {
    // El usuario ya existe, no necesitamos crearlo
    return;
  }
  
  // Crear el usuario en nuestra base de datos
  await db.insert(users).values({
    username,
    email: email || '',
    password: '', // No almacenamos la contraseña, ya que Clerk se encarga de la autenticación
    fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
    clerkId: userData.id,
    role: 'user',
  });
  
  console.log(`Usuario creado con clerkId: ${userData.id}`);
}

/**
 * Maneja el evento de actualización de usuario de Clerk
 */
async function handleUserUpdated(userData: WebhookEvent['data']) {
  const email = userData.email_addresses[0]?.email_address;
  const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  
  // Actualizar el usuario en nuestra base de datos
  await db.update(users)
    .set({
      email: email || '',
      username: userData.username || email?.split('@')[0] || `user_${userData.id}`,
      fullName
    })
    .where(eq(users.clerkId, userData.id));
    
  console.log(`Usuario actualizado con clerkId: ${userData.id}`);
}

/**
 * Maneja el evento de eliminación de usuario de Clerk
 */
async function handleUserDeleted(userData: WebhookEvent['data']) {
  // En un sistema de producción, podrías no eliminar definitivamente
  // sino marcar como inactivo o realizar un borrado lógico
  
  await db.delete(users)
    .where(eq(users.clerkId, userData.id));
    
  console.log(`Usuario eliminado con clerkId: ${userData.id}`);
}