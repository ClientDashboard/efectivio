#!/bin/bash

# Colores para mejor visualización
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de éxito
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar errores
error() {
  echo -e "${RED}❌ $1${NC}"
}

# Función para mostrar información
info() {
  echo -e "${BLUE}ℹ️ $1${NC}"
}

# Función para mostrar advertencias
warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

# Verificar si las variables de entorno están configuradas
check_env() {
  if [ -z "$SUPABASE_URL" ]; then
    error "La variable de entorno SUPABASE_URL no está configurada."
    return 1
  fi
  
  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    error "La variable de entorno SUPABASE_SERVICE_ROLE_KEY no está configurada."
    return 1
  fi
  
  if [ -z "$DATABASE_URL" ]; then
    warning "La variable de entorno DATABASE_URL no está configurada. No se podrá usar psql directamente."
    warning "Se intentará usar la API REST de Supabase en su lugar."
    return 0
  fi
  
  return 0
}

# Verificar si se pueden instalar dependencias
install_dependencies() {
  info "Verificando e instalando dependencias necesarias..."
  
  # node-fetch para scripts JavaScript
  npm list node-fetch > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    info "Instalando node-fetch..."
    npm install --save node-fetch
  fi
  
  # tsx para scripts TypeScript
  if ! command -v tsx &> /dev/null; then
    info "Instalando tsx para ejecutar TypeScript..."
    npm install -g tsx
  fi
  
  success "Dependencias instaladas correctamente."
}

# Crear buckets de almacenamiento
create_buckets() {
  info "Creando buckets de almacenamiento en Supabase..."
  cd scripts && tsx create-buckets.ts
  
  if [ $? -eq 0 ]; then
    success "Buckets creados exitosamente en Supabase."
    return 0
  else
    error "Error al crear buckets en Supabase."
    return 1
  fi
}

# Aplicar esquema de base de datos
apply_database_schema() {
  info "Aplicando esquema de base de datos a Supabase..."
  
  # Intentar primero con psql si DATABASE_URL está configurado
  if [ ! -z "$DATABASE_URL" ]; then
    info "Utilizando psql para aplicar el esquema directamente..."
    psql "$DATABASE_URL" -f scripts/init-database.sql 2> /tmp/db_error.log
    
    if [ $? -eq 0 ]; then
      success "Esquema de base de datos aplicado exitosamente con psql."
      return 0
    else
      warning "Error al aplicar el esquema con psql. Detalles:"
      cat /tmp/db_error.log
      warning "Intentando con API REST como alternativa..."
    fi
  fi
  
  # Si DATABASE_URL no está configurado o falló psql, usar API REST
  info "Utilizando API REST para aplicar el esquema..."
  node --experimental-modules scripts/apply-database-schema.js
  
  if [ $? -eq 0 ]; then
    success "Esquema de base de datos aplicado exitosamente mediante API REST."
    return 0
  else
    error "Error al aplicar el esquema de base de datos."
    return 1
  fi
}

# Función principal
main() {
  echo ""
  echo "===========================================" 
  echo "  CONFIGURACIÓN COMPLETA DE SUPABASE"
  echo "===========================================" 
  echo ""
  
  # Verificar variables de entorno
  check_env
  if [ $? -ne 0 ]; then
    error "No se puede continuar sin las variables de entorno requeridas."
    exit 1
  fi
  
  # Instalar dependencias
  install_dependencies
  
  # Crear buckets
  create_buckets
  if [ $? -ne 0 ]; then
    warning "Hubo problemas al crear los buckets, pero continuaremos con la configuración."
  fi
  
  # Aplicar esquema de base de datos
  apply_database_schema
  if [ $? -ne 0 ]; then
    error "Error al aplicar el esquema de base de datos. Abortando."
    exit 1
  fi
  
  echo ""
  success "Configuración de Supabase completada exitosamente."
  echo ""
  info "Ahora puedes usar la aplicación con todas las funcionalidades de Supabase."
  echo ""
}

# Ejecutar la función principal
main