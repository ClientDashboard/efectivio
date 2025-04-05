import bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

async function createAdminUser() {
  // Verificar que las variables de entorno necesarias estén definidas
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: Se requiere la variable de entorno DATABASE_URL');
    process.exit(1);
  }

  console.log('Conectando a la base de datos...');
  
  // Crear cliente de PostgreSQL directamente
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Generar hash de la contraseña
    const password = 'Contrasena123!';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar el usuario utilizando SQL directo
    console.log('Insertando usuario administrador...');
    const queryText = `
      INSERT INTO users (username, email, password, role, fullname, name, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, role;
    `;
    
    const values = [
      'admin',
      'admin@efectivio.com',
      hashedPassword,
      'administrador_sistema',
      'Administrador Principal',
      'Admin',
      true,
      new Date()
    ];

    const result = await client.query(queryText, values);
    const user = result.rows[0];

    console.log('✅ Usuario administrador creado exitosamente:', user);
    console.log('  Username:', user.username);
    console.log('  Password:', password);
    console.log('  Role:', user.role);
    console.log('\nPuede iniciar sesión con estas credenciales en la aplicación.');
  } catch (error) {
    console.error('❌ Error al insertar usuario:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar la función principal
createAdminUser();