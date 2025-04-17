// This file is no longer needed as we're using @neondatabase/serverless directly
// Keeping this file with a warning for backward compatibility

export async function getPgClient() {
  console.warn("pg-client.ts is deprecated. Please use @neondatabase/serverless directly.")
  throw new Error("pg-client.ts is deprecated. Please use @neondatabase/serverless directly.")
}
