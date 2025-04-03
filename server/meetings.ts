import {
  MeetingIntegration, 
  InsertMeetingIntegration,
  Meeting,
  InsertMeeting,
  MeetingProvider,
  Appointment,
  TranscriptionStatus
} from '@shared/schema';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { meetings, meetingIntegrations } from '@shared/schema';
import { supabase } from './supabase';
import { transcribeAudio, generateMeetingSummary, extractKeyPointsAndActions } from './ai';

// Constante para el bucket de almacenamiento de grabaciones
const RECORDINGS_BUCKET = 'meeting_recordings';

/**
 * Crea un nuevo registro de reunión asociado a una cita
 * @param meetingData Datos de la reunión
 * @returns La reunión creada
 */
export async function createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
  const [meeting] = await db.insert(meetings)
    .values(meetingData)
    .returning();
  
  return meeting;
}

/**
 * Guarda una integración de reunión (enlaces y credenciales para acceder)
 * @param integrationData Datos de la integración
 * @returns La integración creada
 */
export async function saveMeetingIntegration(
  integrationData: InsertMeetingIntegration
): Promise<MeetingIntegration> {
  const [integration] = await db.insert(meetingIntegrations)
    .values(integrationData)
    .returning();
  
  return integration;
}

/**
 * Genera un enlace de reunión basado en el proveedor seleccionado
 * Esta es una función simulada, en un entorno real se conectaría con las APIs
 * de Google Meet, Zoom, etc.
 * 
 * @param provider Proveedor de la reunión
 * @param meetingId ID de la reunión
 * @param appointmentId ID de la cita asociada
 * @returns URL e información de la reunión
 */
export async function generateMeetingLink(
  provider: MeetingProvider,
  meetingId: number,
  appointmentId: number
): Promise<{ meetingUrl: string, meetingId: string }> {
  // En una implementación real, aquí se conectaría con las APIs de cada proveedor
  // para crear una reunión programada
  
  // Simulación de respuesta
  const mockMeetingId = `meeting-${Date.now()}-${meetingId}`;
  let meetingUrl = '';
  
  switch (provider) {
    case 'google_meet':
      meetingUrl = `https://meet.google.com/${mockMeetingId}`;
      break;
    case 'zoom':
      meetingUrl = `https://zoom.us/j/${mockMeetingId}`;
      break;
    case 'teams':
      meetingUrl = `https://teams.microsoft.com/l/meetup-join/${mockMeetingId}`;
      break;
    default:
      meetingUrl = `https://meeting.efectivio.com/${mockMeetingId}`;
  }
  
  // Guardar la integración (corrigiendo los campos para que coincidan con el esquema)
  await saveMeetingIntegration({
    userId: 'user-1', // En un caso real, este sería el ID del usuario autenticado
    provider,
    accessToken: null, // En un caso real, aquí iría el token
    refreshToken: null, // En un caso real, aquí iría el token de refresh
    tokenExpiry: null, // En un caso real, aquí iría la fecha de expiración
    settings: [], // Configuraciones por defecto
    isActive: true
  });
  
  return {
    meetingUrl,
    meetingId: mockMeetingId
  };
}

/**
 * Sube una grabación de reunión al storage
 * @param meetingId ID de la reunión
 * @param recording Buffer de la grabación
 * @returns URL de la grabación
 */
export async function uploadMeetingRecording(
  meetingId: number,
  recording: Buffer,
  fileName: string
): Promise<string> {
  const filePath = `meeting-${meetingId}/${fileName}`;
  
  // Subir la grabación a Supabase Storage
  const { data, error } = await supabase.storage
    .from(RECORDINGS_BUCKET)
    .upload(filePath, recording, {
      contentType: 'audio/mpeg', // O el tipo adecuado
      cacheControl: '3600'
    });
  
  if (error) {
    console.error('Error uploading meeting recording:', error);
    throw new Error(`Error al subir la grabación: ${error.message}`);
  }
  
  // Actualizar el registro de la reunión con la URL de la grabación
  const publicUrl = supabase.storage.from(RECORDINGS_BUCKET).getPublicUrl(filePath).data.publicUrl;
  
  await db.update(meetings)
    .set({ recordingUrl: publicUrl })
    .where(eq(meetings.id, meetingId));
  
  // Iniciar proceso de transcripción
  try {
    await transcribeAudio(recording, meetingId);
  } catch (error: any) { // Especificamos el tipo de error
    console.error('Error starting transcription:', error);
    // Continuamos a pesar del error en la transcripción
  }
  
  return publicUrl;
}

/**
 * Procesa una reunión completada para obtener información valiosa
 * @param meetingId ID de la reunión
 * @returns Resumen y puntos importantes de la reunión
 */
export async function processMeetingData(meetingId: number): Promise<{
  summary: string;
  keyPoints: string[];
  actions: string[];
}> {
  try {
    // Verificar si la transcripción está completa
    const [meetingData] = await db.select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));
    
    if (!meetingData) {
      throw new Error('Reunión no encontrada');
    }
    
    if (meetingData.transcriptionStatus !== 'completed') {
      throw new Error('La transcripción aún no está completa');
    }
    
    // Generar resumen
    const summary = await generateMeetingSummary(meetingId);
    
    // Extraer puntos clave y acciones
    const { keyPoints, actions } = await extractKeyPointsAndActions(meetingId);
    
    // Actualizar el registro de la reunión con el resumen
    await db.update(meetings)
      .set({ 
        summary,
        keyPoints,
        actionItems: actions
      })
      .where(eq(meetings.id, meetingId));
    
    return {
      summary,
      keyPoints,
      actions
    };
  } catch (error: any) { // Especificamos el tipo de error
    console.error('Error processing meeting data:', error);
    throw new Error(`Error al procesar los datos de la reunión: ${error.message}`);
  }
}

/**
 * Obtiene los detalles completos de una reunión
 * @param meetingId ID de la reunión
 * @returns Información completa de la reunión
 */
export async function getMeetingDetails(meetingId: number): Promise<{
  meeting: Meeting;
  integration: MeetingIntegration | null;
}> {
  // Obtener información de la reunión
  const [meeting] = await db.select()
    .from(meetings)
    .where(eq(meetings.id, meetingId));
  
  if (!meeting) {
    throw new Error('Reunión no encontrada');
  }
  
  // Obtener información de la integración
  // Nota: En el esquema real no hay un campo meetingId en la tabla meetingIntegrations
  // por lo que esta consulta debería modificarse según la relación correcta
  const integrations = await db.select()
    .from(meetingIntegrations)
    .where(eq(meetingIntegrations.userId, 'user-1')); // Buscamos por el usuario en lugar del meetingId
    
  const integration = integrations.length > 0 ? integrations[0] : null;
  
  return {
    meeting,
    integration
  };
}

/**
 * Inicializa el bucket de almacenamiento para grabaciones
 */
export async function initializeMeetingStorageBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  // Verificar si el bucket ya existe
  const bucketExists = buckets?.some(bucket => bucket.name === RECORDINGS_BUCKET);
  
  if (!bucketExists) {
    // Crear el bucket si no existe
    const { error } = await supabase.storage.createBucket(RECORDINGS_BUCKET, {
      public: false, // No hacemos el bucket público por seguridad
    });
    
    if (error) {
      console.error('Error creating recordings bucket:', error);
      throw new Error(`Error al crear el bucket para grabaciones: ${error.message}`);
    }
    
    console.log(`Bucket '${RECORDINGS_BUCKET}' creado exitosamente`);
  }
}