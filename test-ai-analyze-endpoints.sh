#!/bin/bash

# Aseguramos que el script se detenga en caso de error
set -e

# URL de los endpoints
API_ENDPOINT="http://localhost:3000/api/ai/analyze-text"
TEST_ENDPOINT="http://localhost:3000/api/test/analyze-text"

# Texto de ejemplo para analizar
TEXTO="Las ventas del último trimestre han aumentado en un 15% comparado con el trimestre anterior. 
La línea de productos premium ha sido especialmente exitosa, con un incremento del 25% en ventas. 
Los clientes han expresado satisfacción con la nueva plataforma de pedidos en línea, pero han reportado
algunos problemas con el proceso de devolución. 
Necesitamos mejorar el sistema de devoluciones y considerar expandir nuestra línea premium para el próximo trimestre."

# Función para probar un endpoint
test_endpoint() {
  local url=$1
  local name=$2
  
  echo "=== Probando endpoint $name ==="
  echo "URL: $url"
  
  # Ejecutar la petición
  echo "Enviando solicitud de análisis de texto..."
  local response=$(curl -s -X POST $url \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$TEXTO\"}")
  
  # Verificar si la respuesta es un JSON válido
  if echo "$response" | jq . >/dev/null 2>&1; then
    echo "✅ Respuesta válida (JSON)"
    echo "Respuesta:"
    echo "$response" | jq .
  else
    echo "❌ Respuesta inválida (no es JSON)"
    echo "Respuesta en bruto:"
    echo "$response"
  fi
  
  echo ""
}

# Probar endpoints
test_endpoint "$TEST_ENDPOINT" "Test (sin autenticación)"
echo "Nota: El endpoint API con autenticación requiere credenciales, pero puedes probarlo desde la interfaz web navegando a /ai/text-analysis"

echo "Pruebas completadas."