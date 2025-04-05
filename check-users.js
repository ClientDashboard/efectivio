import pg from 'pg';
import 'dotenv/config';

async function checkUsers() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Consultar los usuarios existentes
    const res = await client.query(`
      SELECT id, username, email, role, name, fullname, is_active, created_at
      FROM users
      ORDER BY id;
    `);
    
    console.log('Lista de usuarios en la base de datos:');
    console.table(res.rows);
    console.log(`Total de usuarios: ${res.rows.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkUsers();