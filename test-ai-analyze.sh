#!/bin/bash

# Aseguramos que el script se detenga en caso de error
set -e

# Texto de ejemplo para analizar
TEXTO="Las ventas del último trimestre han aumentado en un 15% comparado con el trimestre anterior. 
La línea de productos premium ha sido especialmente exitosa, con un incremento del 25% en ventas. 
Los clientes han expresado satisfacción con la nueva plataforma de pedidos en línea, pero han reportado
algunos problemas con el proceso de devolución. 
Necesitamos mejorar el sistema de devoluciones y considerar expandir nuestra línea premium para el próximo trimestre."

# URL del endpoint
URL="http://localhost:3000/api/test/analyze-text"

# Ejecutar la petición
echo "Enviando solicitud de análisis de texto..."
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXTO\"}" | jq .

echo -e "\nSolicitud completada."