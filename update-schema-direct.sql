-- Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  json_value JSONB,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear tabla de white label
CREATE TABLE IF NOT EXISTS white_label (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT,
  custom_domain TEXT,
  show_powered_by BOOLEAN NOT NULL DEFAULT TRUE,
  custom_css TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  client_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insertar configuración predeterminada
INSERT INTO system_config (key, value, description, category) 
VALUES 
('app_name', 'Efectivio', 'Nombre de la aplicación', 'branding'),
('company_name', 'Efectivio', 'Nombre de la empresa', 'branding'),
('logo_url', '/images/primary-logo.png', 'URL del logo principal', 'branding'),
('powered_by_text', 'Powered by Efectivio', 'Texto del pie de página', 'branding')
ON CONFLICT (key) DO NOTHING;

-- Insertar configuración de white label predeterminada
INSERT INTO white_label (company_name, logo, primary_color, show_powered_by) 
VALUES ('Efectivio', '/images/primary-logo.png', '#0ea5e9', TRUE);