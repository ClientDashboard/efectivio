import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { Client } from "@neondatabase/serverless";

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create a new Neon client
const sql = neon(process.env.DATABASE_URL);

// Importamos el esquema para que Drizzle ORM pueda hacer las consultas correctamente
import * as schema from "@shared/schema";

// Using the Neon client for Drizzle ORM with schema
export const db = drizzle(sql, { schema });

// Function to get a standalone Postgres client for operations that need it
export const getClient = async (): Promise<Client> => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  return client;
};

// Function to close a client connection
export const closeClient = async (client: Client): Promise<void> => {
  await client.end();
};
