#!/bin/bash

# Verificar si las variables de entorno están configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas."
  echo "Asegúrate de configurarlas antes de ejecutar este script."
  exit 1
fi

# Verificar si typescript está instalado
if ! command -v tsx &> /dev/null; then
  echo "Instalando tsx para ejecutar TypeScript..."
  npm install -g tsx
fi

# Ejecutar el script
echo "Iniciando la creación de buckets en Supabase..."
cd scripts && tsx create-buckets.ts

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo "✅ Buckets creados exitosamente en Supabase."
else
  echo "❌ Error al crear buckets en Supabase."
  exit 1
fi