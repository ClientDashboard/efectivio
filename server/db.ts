import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Client } from "@neondatabase/serverless";
// import * as schema from "@shared/schema"; // Removed as per simplification

// Check for DATABASE_URL environment variable
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create a Postgres.js client
export const client = postgres(DATABASE_URL);

// Create a Drizzle ORM instance
export const db = drizzle(client);

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