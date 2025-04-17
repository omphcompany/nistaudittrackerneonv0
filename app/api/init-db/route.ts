import { NextResponse } from "next/server"
import { initializeDatabase, executeQuery } from "@/lib/db-connection"

// Mark this file as server-side only
export const runtime = "nodejs"

// GET to initialize the database and check connection
export async function GET() {
  try {
    console.log("API: Initializing database and checking connection")

    // Test database connection first
    try {
      const connectionTest = await executeQuery("SELECT 1 as connection_test")
      console.log("Database connection test:", connectionTest.rows)
    } catch (connError) {
      console.error("Database connection test failed:", connError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connError instanceof Error ? connError.message : String(connError),
          env: {
            hasDbUrl: !!process.env.DATABASE_URL,
            hasPostgresUrl: !!process.env.POSTGRES_URL,
            nodeEnv: process.env.NODE_ENV,
          },
        },
        { status: 500 },
      )
    }

    // Initialize database
    const result = await initializeDatabase()

    if (result) {
      return NextResponse.json({
        success: true,
        message: "Database initialized successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize database",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
