import { initializeDatabase } from "./db-connection"

// Initialize the database when the server starts
export async function initDb() {
  try {
    await initializeDatabase()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}
