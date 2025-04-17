import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("API: Testing database connection")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Test with a simple query using tagged template literal
    const connectionTest = await sql`SELECT 1 as connection_test`
    console.log("Database connection test:", connectionTest)

    // Get the count of controls
    const countResult = await sql`SELECT COUNT(*) as count FROM "NistControl"`
    const count = countResult[0].count

    // Get a sample of controls (limit to 5)
    const sampleControls = await sql`
      SELECT * FROM "NistControl" 
      ORDER BY "lastUpdated" DESC
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      connectionTest,
      controlCount: count,
      sampleControls,
    })
  } catch (error) {
    console.error("API: Error testing database connection:", error)
    return NextResponse.json(
      {
        error: "Database connection test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
