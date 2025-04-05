import pg from 'pg';
import 'dotenv/config';

async function checkTableStructure() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Consultar la estructura de la tabla users
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura de la tabla users:');
    console.table(res.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTableStructure();