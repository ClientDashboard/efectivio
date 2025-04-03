-- Crear los ENUMS primero
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE expense_category AS ENUM ('office', 'travel', 'marketing', 'utilities', 'rent', 'salary', 'equipment', 'supplies', 'taxes', 'other');
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
CREATE TYPE file_category AS ENUM ('invoice', 'quote', 'receipt', 'contract', 'report', 'tax', 'other');
CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE appointment_type AS ENUM ('meeting', 'call', 'video_call', 'other');
CREATE TYPE meeting_provider AS ENUM ('google_meet', 'zoom', 'teams', 'other');
CREATE TYPE transcription_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  clerk_id TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL,
  issue_date TIMESTAMP NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Elementos de Facturas
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  tax_rate NUMERIC(5, 2) DEFAULT 0
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  amount NUMERIC(10, 2) NOT NULL,
  category expense_category NOT NULL DEFAULT 'other',
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Cuentas Contables
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  description TEXT,
  parent_id INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Asientos Contables
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  reference TEXT,
  description TEXT NOT NULL,
  source_type TEXT,
  source_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Líneas de Asientos Contables
CREATE TABLE IF NOT EXISTS journal_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  description TEXT,
  debit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Tabla de Archivos
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  client_id INTEGER,
  project_id INTEGER,
  company_id INTEGER,
  category file_category NOT NULL DEFAULT 'other',
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Invitaciones para Clientes
CREATE TABLE IF NOT EXISTS client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Usuarios del Portal de Clientes
CREATE TABLE IF NOT EXISTS client_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  last_login TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP,
  status project_status NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id INTEGER NOT NULL,
  assigned_to UUID NOT NULL,
  due_date TIMESTAMP,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  estimated_hours NUMERIC(5, 2),
  actual_hours NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Registro de Tiempos
CREATE TABLE IF NOT EXISTS time_entries (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  description TEXT,
  hours NUMERIC(5, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Citas
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id INTEGER NOT NULL,
  project_id INTEGER,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  type appointment_type NOT NULL DEFAULT 'meeting',
  meeting_url TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Reuniones
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  appointment_id INTEGER,
  project_id INTEGER,
  client_id INTEGER NOT NULL,
  provider meeting_provider NOT NULL DEFAULT 'google_meet',
  external_meeting_id TEXT,
  meeting_url TEXT,
  recording_url TEXT,
  recording_status TEXT DEFAULT 'not_started',
  transcription_status transcription_status DEFAULT 'pending',
  transcription TEXT,
  summary TEXT,
  duration INTEGER,
  meeting_date TIMESTAMP NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  participants TEXT[],
  key_points TEXT[],
  action_items TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Segmentos de Transcripción
CREATE TABLE IF NOT EXISTS transcription_segments (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL,
  speaker_name TEXT,
  speaker_id TEXT,
  content TEXT NOT NULL,
  start_time NUMERIC(10, 3) NOT NULL,
  end_time NUMERIC(10, 3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de Integraciones con Proveedores de Videollamadas
CREATE TABLE IF NOT EXISTS meeting_integrations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  provider meeting_provider NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP,
  settings TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear relaciones con claves foráneas
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE invoice_items ADD CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

ALTER TABLE journal_lines ADD CONSTRAINT fk_journal_lines_journal_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE;
ALTER TABLE journal_lines ADD CONSTRAINT fk_journal_lines_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT;

ALTER TABLE accounts ADD CONSTRAINT fk_accounts_parent FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE RESTRICT;

ALTER TABLE client_invitations ADD CONSTRAINT fk_client_invitations_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE client_portal_users ADD CONSTRAINT fk_client_portal_users_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE projects ADD CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE appointments ADD CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE meetings ADD CONSTRAINT fk_meetings_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE meetings ADD CONSTRAINT fk_meetings_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
ALTER TABLE meetings ADD CONSTRAINT fk_meetings_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE transcription_segments ADD CONSTRAINT fk_transcription_segments_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE;

ALTER TABLE files ADD CONSTRAINT fk_files_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE files ADD CONSTRAINT fk_files_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;