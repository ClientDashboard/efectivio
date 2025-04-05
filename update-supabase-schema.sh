#!/bin/bash

# Verificar si DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "Error: La variable de entorno DATABASE_URL no está configurada."
  echo "Asegúrate de configurarla antes de ejecutar este script."
  exit 1
fi

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Crear un archivo temporal para el log de errores
ERROR_LOG=$(mktemp)

echo -e "${BLUE}Actualizando el esquema de usuarios en la base de datos...${NC}"
psql "$DATABASE_URL" -f scripts/update-users-schema.sql 2> "$ERROR_LOG"

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Esquema de usuarios actualizado exitosamente.${NC}"
else
  echo -e "${RED}❌ Error al actualizar el esquema de usuarios.${NC}"
  echo -e "${RED}Detalles del error:${NC}"
  cat "$ERROR_LOG"
  rm "$ERROR_LOG"
  exit 1
fi

# Limpiar archivo temporal
rm "$ERROR_LOG"

# Dooble: Verificar si necesitamos ejecutar tambien npm run db:push
if [ -f "drizzle.config.ts" ] && [ -x "$(command -v npm)" ]; then
  echo -e "${BLUE}Ejecutando npm run db:push para mantener el esquema de Drizzle actualizado...${NC}"
  npm run db:push

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Esquema de Drizzle actualizado correctamente.${NC}"
  else
    echo -e "${RED}⚠️ Hubo un problema al actualizar el esquema de Drizzle.${NC}"
    echo -e "${RED}Es posible que necesites revisar manualmente el esquema.${NC}"
  fi
fi

echo -e "${GREEN}Esquema de base de datos actualizado correctamente.${NC}"
echo ""
echo "Ahora puedes reiniciar la aplicación para que los cambios surtan efecto."
