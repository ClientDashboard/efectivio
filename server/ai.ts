import { HfInference } from '@huggingface/inference';
import {
  TranscriptionSegment,
  InsertTranscriptionSegment,
  Meeting,
  TranscriptionStatus
} from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { transcriptionSegments, meetings } from '@shared/schema';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Procesa un archivo de audio para transcribir utilizando Hugging Face
 * @param audioBuffer Buffer del archivo de audio
 * @param meetingId ID de la reunión asociada
 * @returns Array de segmentos de transcripción
 */
export async function transcribeAudio(audioBuffer: Buffer, meetingId: number): Promise<TranscriptionSegment[]> {
  try {
    // Actualizar el estado de la transcripción a "en progreso"
    await db.update(meetings)
      .set({ transcriptionStatus: 'in_progress' as TranscriptionStatus })
      .where(eq(meetings.id, meetingId));

    // Usar el modelo Whisper para transcripción de audio
    const result = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3',
      data: audioBuffer,
    });

    // Guardar la transcripción en la base de datos
    const segment: InsertTranscriptionSegment = {
      meetingId,
      startTime: "0", // Usar string para representar valores numéricos
      endTime: "0", // Usar string para representar valores numéricos
      content: result.text, // Usar content en lugar de text
      speakerId: null, // No tenemos identificación de hablante
    };

    const [savedSegment] = await db.insert(transcriptionSegments)
      .values(segment)
      .returning();

    // Actualizar el estado de la transcripción a "completada"
    await db.update(meetings)
      .set({ transcriptionStatus: 'completed' as TranscriptionStatus })
      .where(eq(meetings.id, meetingId));

    return [savedSegment];
  } catch (error: any) { // Especificamos el tipo de error
    console.error('Error during transcription:', error);

    // Actualizar el estado de la transcripción a "fallida"
    await db.update(meetings)
      .set({ transcriptionStatus: 'failed' as TranscriptionStatus })
      .where(eq(meetings.id, meetingId));

    throw new Error(`Error al transcribir audio: ${error.message}`);
  }
}

/**
 * Genera un resumen de la transcripción de una reunión
 * @param meetingId ID de la reunión
 * @returns Resumen de la reunión
 */
export async function generateMeetingSummary(meetingId: number): Promise<string> {
  try {
    // Obtener todos los segmentos de transcripción de la reunión
    const transcription = await db.select()
      .from(transcriptionSegments)
      .where(eq(transcriptionSegments.meetingId, meetingId));

    if (!transcription.length) {
      throw new Error('No hay transcripción disponible para esta reunión');
    }

    // Combinar todos los segmentos de texto
    const fullText = transcription.map(segment => segment.content).join(' ');

    // Generar un resumen utilizando un modelo de Hugging Face
    const summaryResult = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: fullText,
      parameters: {
        max_length: 300,
        min_length: 100,
      }
    });

    return summaryResult.summary_text;
  } catch (error: any) { // Especificamos el tipo de error
    console.error('Error generating meeting summary:', error);
    throw new Error(`Error al generar resumen de la reunión: ${error.message}`);
  }
}

/**
 * Extrae puntos clave y acciones de una transcripción de reunión
 * @param meetingId ID de la reunión
 * @returns Objeto con puntos clave y acciones a realizar
 */
export async function extractKeyPointsAndActions(meetingId: number): Promise<{ keyPoints: string[], actions: string[] }> {
  try {
    // Obtener todos los segmentos de transcripción de la reunión
    const transcription = await db.select()
      .from(transcriptionSegments)
      .where(eq(transcriptionSegments.meetingId, meetingId));

    if (!transcription.length) {
      throw new Error('No hay transcripción disponible para esta reunión');
    }

    // Combinar todos los segmentos de texto
    const fullText = transcription.map(segment => segment.content).join(' ');

    // Consulta para extraer puntos clave y acciones
    const prompt = `
    Analiza la siguiente transcripción de una reunión y extrae:
    1. Los puntos clave discutidos (máximo 5)
    2. Las acciones acordadas para realizar (máximo 5)
    
    Transcripción:
    ${fullText}
    
    Responde en formato JSON con las claves "keyPoints" y "actions", ambas como arrays de strings.
    `;

    // Usar un modelo de texto para analizar la transcripción
    const result = await hf.textGeneration({
      model: 'google/gemma-7b',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1024,
        return_full_text: false,
      }
    });

    // Extraer JSON de la respuesta
    let jsonStr = result.generated_text.trim();
    
    // Intentar parsear el resultado como JSON
    try {
      // Encontrar el primer '{' y el último '}'
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}') + 1;
      
      if (startIdx >= 0 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx);
      }
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        actions: Array.isArray(parsed.actions) ? parsed.actions : []
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Proporcionar un resultado por defecto si el parsing falla
      return {
        keyPoints: ["No se pudieron extraer puntos clave automáticamente."],
        actions: ["No se pudieron extraer acciones automáticamente."]
      };
    }
  } catch (error: any) { // Especificamos el tipo de error
    console.error('Error extracting key points and actions:', error);
    throw new Error(`Error al extraer puntos clave y acciones: ${error.message}`);
  }
}