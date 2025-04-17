import { executeQuery, initializeDatabase as initDb } from "./db-connection"

export async function initializeDatabase(): Promise<boolean> {
  try {
    return await initDb()
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// Function to test the database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await executeQuery("SELECT 1 as test")
    return result.rows.length > 0 && result.rows[0].test === 1
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
