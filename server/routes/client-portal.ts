import { Router } from 'express';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { clients } from '@shared/schema';
import { db } from '../db';

const router = Router();

// Obtener todos los clientes con acceso al portal
router.get('/portal', async (req, res) => {
  try {
    const clientsList = await db.select().from(clients);
    res.json(clientsList);
  } catch (error) {
    console.error('Error al obtener clientes para el portal:', error);
    res.status(500).json({ error: 'Error al obtener clientes para el portal' });
  }
});

// Obtener un cliente específico por ID
router.get('/portal/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (!client.hasPortalAccess) {
      return res.status(403).json({ error: 'Este cliente no tiene acceso al portal' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ error: 'Error al obtener cliente por ID' });
  }
});

export default router;