# Efectivio

Sistema integral de gestión contable y portal de clientes con funcionalidades avanzadas de IA.

## Características Principales

- Sistema completo de contabilidad
- Portal de clientes
- Análisis financiero
- Integración con IA
- Gestión de documentos

## Tecnologías

- Frontend: React + TypeScript
- Backend: Express.js
- Base de datos: PostgreSQL
- Autenticación: Clerk
- Almacenamiento: Supabase


## Requisitos

- Node.js v18+ y npm
- Base de datos PostgreSQL
- Cuenta en Clerk para autenticación
- Proyecto en Supabase
- Clave API de Hugging Face

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/ClientDashboard/efectivioweb.git
   cd efectivioweb
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example`:
   ```
   cp .env.example .env
   ```

4. Configura las variables de entorno en el archivo `.env` con tus credenciales.

5. Inicializa la base de datos:
   ```
   npm run db:push
   ```

6. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

## Estructura del Proyecto

- `/client/`: Código del frontend
  - `/src/components/`: Componentes React
  - `/src/pages/`: Páginas de la aplicación
  - `/src/lib/`: Funciones utilitarias
  - `/src/hooks/`: Custom hooks de React
  
- `/server/`: Código del backend
  - `/routes.ts`: Definición de rutas API
  - `/db.ts`: Configuración de la base de datos
  - `/storage.ts`: Acceso al almacenamiento
  - `/ai.ts`: Funcionalidades de IA
  - `/webhooks/`: Manejadores de webhooks

- `/shared/`: Código compartido
  - `/schema.ts`: Esquema de la base de datos

## Funcionalidades Principales

### Sistema Contable
- Gestión de clientes
- Facturación
- Control de gastos
- Asientos contables
- Balance general y estado de resultados

### Portal de Clientes
- Registro e inicio de sesión de clientes
- Gestión de proyectos y tareas
- Registro de horas trabajadas
- Agendamiento de citas

### IA y Análisis
- Transcripción automática de reuniones
- Generación de resúmenes y extracción de puntos clave
- Análisis de textos con IA

## Licencia

Este proyecto está bajo licencia [MIT](LICENSE).

## Contacto

Para más información, contacta a [tu@correo.com](mailto:tu@correo.com).# efectivio
