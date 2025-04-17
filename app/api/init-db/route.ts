import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("API: Initializing database")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Test the connection
    const connectionTest = await sql`SELECT 1 as connection_test`
    console.log("Database connection test:", connectionTest)

    // Create NistControl table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "NistControl" (
        id SERIAL PRIMARY KEY,
        "owner" TEXT NOT NULL DEFAULT 'Unknown',
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
    `

    // Create ExcelFile table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "ExcelFile" (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        description TEXT,
        "fileSize" INTEGER NOT NULL,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "uploadedBy" TEXT
      )
    `

    // Get the count of controls
    const countResult = await sql`SELECT COUNT(*) as count FROM "NistControl"`
    const count = countResult[0].count

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      controlCount: count,
    })
  } catch (error) {
    console.error("API: Error initializing database:", error)
    return NextResponse.json(
      {
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
