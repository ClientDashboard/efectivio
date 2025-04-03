#!/bin/bash

# Verificar si node-fetch está instalado
npm list node-fetch > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Instalando node-fetch..."
  npm install --save node-fetch
fi

# Verificar variables de entorno
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas."
  echo "Asegúrate de configurarlas antes de ejecutar este script."
  exit 1
fi

# Ejecutar el script
echo "Iniciando la aplicación del esquema de base de datos a Supabase..."
node --experimental-modules scripts/apply-database-schema.js

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo "✅ Esquema de base de datos aplicado exitosamente a Supabase."
else
  echo "❌ Error al aplicar el esquema de base de datos a Supabase."
  exit 1
fi