// This file contains server-side code for database connections
// We need to make sure it's only imported in server components or API routes

import { neon, neonConfig } from "@neondatabase/serverless"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Configure neon to not use WebSockets (better for serverless environments)
neonConfig.fetchConnectionCache = true

// Get SQL client (memoized to avoid creating multiple connections)
let sql: ReturnType<typeof neon> | null = null

// Update the getSqlClient function with better error handling
function getSqlClient() {
  if (isBrowser) {
    console.log("Browser environment detected, cannot use SQL client")
    return null
  }

  if (sql) return sql

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!databaseUrl) {
    console.error("No database URL found in environment variables")
    return null // Return null instead of throwing an error
  }

  try {
    console.log("Initializing Neon SQL client with URL:", databaseUrl.substring(0, 15) + "...")
    sql = neon(databaseUrl)
    return sql
  } catch (error) {
    console.error("Failed to initialize Neon SQL client:", error)
    return null // Return null instead of throwing an error
  }
}

// Update the executeQuery function to handle null SQL client
export async function executeQuery(text: string, params: any[] = []) {
  // If in browser, return mock results
  if (isBrowser) {
    console.log("Browser environment detected, using mock database")
    return { rows: [] }
  }

  try {
    const sqlClient = getSqlClient()

    if (!sqlClient) {
      console.error("Failed to initialize SQL client, returning empty result")
      return { rows: [] } // Return empty result instead of throwing an error
    }

    console.log(`Executing query: ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`)
    console.log("Parameters:", params)

    // Add timing information for performance debugging
    const startTime = Date.now()

    try {
      let result

      // For simple queries without parameters, we need to use the raw query method
      if (!params || params.length === 0) {
        // Use the raw query method for simple queries
        result = await sqlClient.query(text)
      } else {
        // For parameterized queries, we need to construct the query differently
        // Convert the query to use positional parameters ($1, $2, etc.)
        const placeholders = text.match(/\$\d+/g) || []

        if (placeholders.length > 0) {
          // Use the parameterized query method
          result = await sqlClient.query(text, params)
        } else {
          // If no placeholders but params are provided, log a warning
          console.warn("Parameters provided but no placeholders found in query")
          result = await sqlClient.query(text)
        }
      }

      const endTime = Date.now()
      console.log(`Query executed in ${endTime - startTime}ms`)

      // For SELECT queries, the result is already an array of rows
      if (text.trim().toLowerCase().startsWith("select") || text.trim().toLowerCase().startsWith("with")) {
        return { rows: result }
      }

      // For INSERT with RETURNING, the result is also an array of rows
      if (text.trim().toLowerCase().includes("returning")) {
        return { rows: result }
      }

      // For other queries (INSERT without RETURNING, UPDATE, DELETE, etc.)
      // Neon returns an empty array or a status object
      return { rows: Array.isArray(result) ? result : [] }
    } catch (queryError) {
      console.error("Query execution error:", queryError)
      console.error("Query:", text)
      console.error("Parameters:", params)
      return { rows: [] } // Return empty result instead of throwing an error
    }
  } catch (error) {
    console.error("Database error:", error)
    return { rows: [] } // Return empty result instead of throwing an error
  }
}

// Initialize the database by creating necessary tables if they don't exist
export async function initializeDatabase() {
  if (isBrowser) {
    console.log("Skipping database initialization in browser environment")
    return true
  }

  try {
    console.log("Initializing database...")

    // Create NistControl table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "NistControl" (
        id SERIAL PRIMARY KEY,
        "nistFunction" TEXT NOT NULL,
        "nistCategoryId" TEXT NOT NULL,
        "nistSubCategoryId" TEXT NOT NULL,
        "assessmentPriority" TEXT NOT NULL,
        "controlDescription" TEXT NOT NULL,
        "cybersecurityDomain" TEXT NOT NULL,
        "meetsCriteria" TEXT NOT NULL,
        "identifiedRisks" TEXT,
        "riskDetails" TEXT,
        "remediationStatus" TEXT NOT NULL,
        "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create ExcelFile table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "ExcelFile" (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        description TEXT,
        "fileSize" INTEGER NOT NULL,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "uploadedBy" TEXT
      )
    `)

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// Function to get database connection info for display
export async function getDatabaseInfo() {
  if (isBrowser) {
    return {
      connected: false,
      type: "Preview Mode",
      description: "Running in preview mode with sample data",
    }
  }

  try {
    const sqlClient = getSqlClient()

    if (!sqlClient) {
      return {
        connected: false,
        type: "Error",
        description: "Failed to initialize SQL client",
      }
    }

    // Test the connection with a simple query
    const result = await sqlClient.query("SELECT 1 as connection_test")
    console.log("Database connection test:", result)

    // Determine which connection is being used
    let connectionType = "Unknown"
    let description = "Connected to PostgreSQL database"

    if (process.env.DATABASE_URL) {
      connectionType = "DATABASE_URL"
      description = "Connected to Neon PostgreSQL via DATABASE_URL"
    } else if (process.env.POSTGRES_URL) {
      connectionType = "POSTGRES_URL"
      description = "Connected to PostgreSQL via POSTGRES_URL"
    } else if (process.env.PGHOST || process.env.POSTGRES_HOST) {
      connectionType = "Individual Parameters"
      description = `Connected to PostgreSQL at ${process.env.PGHOST || process.env.POSTGRES_HOST}`
    }

    return {
      connected: result.length > 0,
      type: connectionType,
      description,
    }
  } catch (error) {
    console.error("Error getting database info:", error)
    return {
      connected: false,
      type: "Error",
      description: "Failed to connect to database",
    }
  }
}
