// Este archivo maneja la funcionalidad de envío de emails usando SendGrid
import sgMail from '@sendgrid/mail';

// Configurar API key de SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Envía un email usando SendGrid
 * @param options Opciones del email
 * @returns Verdadero si el email se envió correctamente
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY no está configurada');
      return false;
    }

    const msg = {
      to: options.to,
      from: process.env.EMAIL_FROM || 'noreply@efectivio.com',
      subject: options.subject,
      text: options.text || '',
      html: options.html || ''
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
}

/**
 * Envía una invitación al portal del cliente
 * @param clientEmail Email del cliente
 * @param clientName Nombre del cliente 
 * @param invitationToken Token de invitación
 * @param expiryDate Fecha de expiración del token
 * @returns Verdadero si el email se envió correctamente
 */
export async function sendClientPortalInvitation(
  clientEmail: string,
  clientName: string,
  invitationToken: string,
  expiryDate: Date
): Promise<boolean> {
  const portalUrl = `${process.env.APP_URL || 'https://efectivio.com'}/portal/register?token=${invitationToken}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #39FFBD; border-bottom: 1px solid #eee; padding-bottom: 10px;">Invitación al Portal de Clientes de Efectivio</h2>
      
      <p>Hola ${clientName},</p>
      
      <p>Has sido invitado a acceder al Portal de Clientes de Efectivio, donde podrás:</p>
      
      <ul style="line-height: 1.6;">
        <li>Ver tus facturas y cotizaciones</li>
        <li>Acceder a documentos compartidos</li>
        <li>Consultar tu información financiera</li>
      </ul>
      
      <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
      
      <p style="text-align: center; margin: 25px 0;">
        <a href="${portalUrl}" style="background-color: #39FFBD; color: #062644; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acceder al Portal</a>
      </p>
      
      <p style="color: #666; font-size: 0.9em;">Este enlace expirará el ${expiryDate.toLocaleDateString()}.</p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8em; color: #666;">
        <p>Si tienes problemas para acceder al portal, por favor contacta a tu asesor.</p>
        <p>No respondas a este correo electrónico, ya que ha sido enviado desde una dirección no monitoreada.</p>
      </div>
    </div>
  `;
  
  const emailText = `
    Invitación al Portal de Clientes de Efectivio
    
    Hola ${clientName},
    
    Has sido invitado a acceder al Portal de Clientes de Efectivio, donde podrás:
    - Ver tus facturas y cotizaciones
    - Acceder a documentos compartidos
    - Consultar tu información financiera
    
    Para completar tu registro, accede al siguiente enlace:
    ${portalUrl}
    
    Este enlace expirará el ${expiryDate.toLocaleDateString()}.
    
    Si tienes problemas para acceder al portal, por favor contacta a tu asesor.
    No respondas a este correo electrónico, ya que ha sido enviado desde una dirección no monitoreada.
  `;
  
  return await sendEmail({
    to: clientEmail,
    subject: 'Invitación al Portal de Clientes de Efectivio',
    text: emailText,
    html: emailHtml
  });
}