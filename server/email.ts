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

    console.log('Iniciando envío de correo a:', options.to);
    
    const fromEmail = process.env.EMAIL_FROM || 'noreply@efectivio.com';
    console.log('Enviando desde:', fromEmail);
    
    const msg = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text || '',
      html: options.html || ''
    };

    console.log('Enviando email con los siguientes datos:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    const response = await sgMail.send(msg);
    console.log('Correo enviado correctamente. Respuesta:', response);
    return true;
  } catch (error: unknown) {
    console.error('Error detallado al enviar email:', error);
    
    // Verificar si el error tiene la estructura esperada
    if (typeof error === 'object' && error !== null) {
      const err = error as any;
      if (err.response) {
        console.error('Detalles de la respuesta del error:', {
          body: err.response.body,
          status: err.response.statusCode
        });
      }
    }
    
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
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitación al Portal de Clientes Efectivio</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Montserrat', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); border-radius: 8px; overflow: hidden;">
        <!-- Header con logo y gradiente -->
        <div style="background: linear-gradient(135deg, #39FFBD 0%, #0d8f69 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">EFECTIVIO</h1>
          <p style="color: #fff; margin: 10px 0 0; font-size: 16px; font-weight: 300;">Tu portal financiero personalizado</p>
        </div>
        
        <!-- Contenido principal -->
        <div style="padding: 30px 40px; background-color: #ffffff;">
          <h2 style="color: #222; font-size: 22px; margin-top: 0; font-weight: 600;">¡Hola ${clientName}!</h2>
          
          <p style="color: #444; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
            Te damos la bienvenida al <strong>Portal de Clientes de Efectivio</strong>, tu espacio personal para gestionar tu información financiera de manera eficiente.
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #39FFBD;">
            <p style="margin-top: 0; color: #333; font-weight: 500; font-size: 16px;">En tu portal podrás:</p>
            <ul style="margin-bottom: 0; padding-left: 25px; color: #555;">
              <li style="margin-bottom: 8px;">Ver y descargar tus facturas y cotizaciones</li>
              <li style="margin-bottom: 8px;">Acceder a todos tus documentos compartidos</li>
              <li style="margin-bottom: 8px;">Consultar tu historial y estado financiero</li>
              <li style="margin-bottom: 0;">Contactar directamente con tu asesor</li>
            </ul>
          </div>
          
          <p style="color: #444; line-height: 1.6; font-size: 16px; margin-bottom: 15px; text-align: center;">
            Para comenzar a utilizar tu portal, haz clic en el siguiente botón:
          </p>
          
          <!-- Botón de acceso -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #39FFBD 0%, #0d8f69 100%); color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 8px rgba(57, 255, 189, 0.25); transition: all 0.3s ease-in-out;">
              Activar Mi Cuenta
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px; text-align: center; margin-top: 15px;">
            Este enlace expirará el <strong>${expiryDate.toLocaleDateString()}</strong>
          </p>
        </div>
        
        <!-- Pie de página -->
        <div style="padding: 20px; background-color: #333; text-align: center; color: #ccc; font-size: 13px;">
          <p style="margin: 0 0 10px;">Si tienes alguna pregunta, contacta a tu asesor financiero.</p>
          <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Efectivio. Todos los derechos reservados.</p>
        </div>
      </div>
      
      <!-- Nota adicional fuera del contenedor principal -->
      <div style="max-width: 600px; margin: 10px auto 0; text-align: center; font-size: 12px; color: #999;">
        <p>Este correo ha sido enviado desde una dirección no monitoreada. Por favor, no respondas a este mensaje.</p>
      </div>
    </body>
    </html>
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