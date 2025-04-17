import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Mark this file as server-side only
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("API: Checking database status")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({
        connected: false,
        error: "No database URL found in environment variables",
        timestamp: new Date().toISOString(),
      })
    }

    // Create a new SQL client directly
    let sql
    try {
      sql = neon(databaseUrl)
    } catch (connError) {
      console.error("Failed to create SQL client:", connError)
      return NextResponse.json({
        connected: false,
        error: "Failed to create database client",
        details: connError instanceof Error ? connError.message : String(connError),
        timestamp: new Date().toISOString(),
      })
    }

    // Test connection
    try {
      const connectionTest = await sql`SELECT 1 as connection_test`
    } catch (connError) {
      console.error("Database connection test failed:", connError)
      return NextResponse.json({
        connected: false,
        error: "Database connection test failed",
        details: connError instanceof Error ? connError.message : String(connError),
        timestamp: new Date().toISOString(),
      })
    }

    // Get table counts
    let controlCount, excelFileCount, recentControls

    try {
      controlCount = await sql`SELECT COUNT(*) FROM "NistControl"`
      excelFileCount = await sql`SELECT COUNT(*) FROM "ExcelFile"`

      // Get the most recent control
      recentControls = await sql`
        SELECT id, "nistFunction", "lastUpdated" 
        FROM "NistControl" 
        ORDER BY "lastUpdated" DESC 
        LIMIT 5
      `
    } catch (queryError) {
      console.error("Error executing queries:", queryError)
      return NextResponse.json({
        connected: true,
        error: "Connected but failed to query tables",
        details: queryError instanceof Error ? queryError.message : String(queryError),
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      connected: true,
      tables: {
        NistControl: Number.parseInt(controlCount[0].count, 10),
        ExcelFile: Number.parseInt(excelFileCount[0].count, 10),
      },
      recentControls: recentControls.map((c) => ({
        id: c.id,
        nistFunction: c.nistFunction,
        lastUpdated: c.lastUpdated,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API: Error checking database status:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        connected: false,
        error: "Failed to check database status",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
