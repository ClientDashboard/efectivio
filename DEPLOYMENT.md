# Guía de Despliegue - Efectivio

Esta guía detalla los pasos necesarios para desplegar el sistema Efectivio en Vercel con el dominio personalizado efectivio.com.

## Requisitos Previos

- Cuenta en GitHub
- Cuenta en Vercel
- Cuenta en Clerk para autenticación
- Proyecto en Supabase para base de datos y almacenamiento
- Cuenta en Hugging Face para las funcionalidades de IA
- Dominio personalizado (efectivio.com)

## Paso 1: Preparar el Repositorio

1. Clona el repositorio en GitHub:
   ```
   git clone https://github.com/ClientDashboard/efectivioweb.git
   cd efectivioweb
   ```

2. Asegúrate de que todos los cambios estén commiteados:
   ```
   git add .
   git commit -m "Preparación para despliegue"
   git push origin main
   ```

## Paso 2: Configurar Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "Add New" > "Project"
3. Importa el repositorio de GitHub (efectivioweb)
4. Configura el proyecto:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Configura las variables de entorno:

   ```
   # Base de datos
   DATABASE_URL=postgres://username:password@hostname:port/database

   # Supabase 
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Clerk Auth
   CLERK_SECRET_KEY=your-clerk-secret-key
   VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   # No incluimos CLERK_WEBHOOK_SECRET todavía

   # Hugging Face
   HUGGINGFACE_API_KEY=your-huggingface-api-key

   # Seguridad
   SESSION_SECRET=random-secret-for-sessions
   ```

6. Haz clic en "Deploy"

## Paso 3: Configurar Dominio Personalizado

1. Una vez que el despliegue sea exitoso, ve a la pestaña "Settings" > "Domains"
2. Agrega tu dominio "efectivio.com"
3. Sigue las instrucciones de Vercel para configurar los registros DNS:
   - Normalmente necesitarás agregar registros A y CNAME en tu proveedor de dominio
   - Espera a que la verificación del dominio sea exitosa (puede tomar hasta 48 horas)

## Paso 4: Configurar Webhook de Clerk

Una vez que el sitio esté desplegado y el dominio configurado:

1. Inicia sesión en [Clerk Dashboard](https://dashboard.clerk.dev)
2. Ve a la sección "Webhooks"
3. Crea un nuevo endpoint con la URL: `https://efectivio.com/api/webhooks/clerk`
4. Configura los eventos a escuchar (user.created, user.updated, user.deleted)
5. Guarda la configuración y copia la clave secreta (signing secret)
6. Regresa a Vercel y agrega esta clave como variable de entorno:
   ```
   CLERK_WEBHOOK_SECRET=tu_clave_secreta_de_webhook
   ```
7. Redespliega la aplicación para aplicar los cambios

## Paso 5: Verificar el Despliegue

1. Visita tu dominio personalizado (efectivio.com)
2. Verifica que puedas acceder a todas las funcionalidades
3. Prueba el flujo de autenticación y registro de usuarios
4. Comprueba la integración con Supabase

## Resolución de Problemas

Si encuentras problemas durante el despliegue:

1. Verifica los logs de despliegue en Vercel
2. Asegúrate de que todas las variables de entorno estén configuradas correctamente
3. Verifica la conexión con la base de datos Supabase
4. Comprueba la configuración de Clerk

## Actualizaciones Futuras

Para actualizar la aplicación:

1. Realiza los cambios en tu repositorio local
2. Commit y push a GitHub
3. Vercel automáticamente desplegará los cambios