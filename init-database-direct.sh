#!/bin/bash

# Verificar si DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "Error: La variable de entorno DATABASE_URL no está configurada."
  echo "Asegúrate de configurarla antes de ejecutar este script."
  exit 1
fi

# Crear un archivo temporal para el log de errores
ERROR_LOG=$(mktemp)

# Ejecutar el script SQL directamente con psql
echo "Aplicando esquema de base de datos mediante psql..."
psql "$DATABASE_URL" -f scripts/init-database.sql 2> "$ERROR_LOG"

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo "✅ Esquema de base de datos aplicado exitosamente."
else
  echo "❌ Error al aplicar el esquema de base de datos."
  echo "Detalles del error:"
  cat "$ERROR_LOG"
  rm "$ERROR_LOG"
  exit 1
fi

# Limpiar archivo temporal
rm "$ERROR_LOG"

echo "Esquema de base de datos aplicado correctamente."