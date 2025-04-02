import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

// Función para inicializar la base de datos
async function main() {
  console.log('🗂️ Verificando base de datos...');
  
  try {
    console.log('Verificando cuentas contables existentes...');
    
    // Verificar si ya existen cuentas contables básicas
    const existingAccounts = await db.select().from(schema.accounts);
    
    if (existingAccounts.length === 0) {
      console.log('💼 Añadiendo cuentas contables iniciales...');
      
      // Crear cuentas contables iniciales
      const accounts = [
        { code: "1000", name: "Caja y Bancos", type: "asset" as const, description: "Efectivo y cuentas bancarias" },
        { code: "1100", name: "Cuentas por Cobrar", type: "asset" as const, description: "Facturas pendientes de cobro" },
        { code: "2000", name: "Cuentas por Pagar", type: "liability" as const, description: "Facturas pendientes de pago" },
        { code: "3000", name: "Capital", type: "equity" as const, description: "Capital del propietario" },
        { code: "4000", name: "Ingresos", type: "revenue" as const, description: "Ingresos por ventas" },
        { code: "5000", name: "Gastos Operativos", type: "expense" as const, description: "Gastos generales de operación" },
      ];
      
      for (const account of accounts) {
        await db.insert(schema.accounts).values({
          code: account.code,
          name: account.name,
          type: account.type,
          description: account.description,
          isActive: true
        });
      }
      
      console.log('✅ Cuentas contables iniciales añadidas correctamente.');
    } else {
      console.log('ℹ️ Ya existen cuentas contables, no se añadirán duplicados.');
    }
    
    console.log('🎉 Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error inesperado:', err);
    process.exit(1);
  });