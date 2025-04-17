import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Mark this file as server-side only
export const runtime = "nodejs"

// GET all controls
export async function GET() {
  try {
    console.log("API: Fetching all controls")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Test with a simple query using tagged template literal
    try {
      const connectionTest = await sql`SELECT 1 as connection_test`
      console.log("Database connection test:", connectionTest)
    } catch (connError) {
      console.error("Database connection test failed:", connError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: connError instanceof Error ? connError.message : String(connError),
        },
        { status: 500 },
      )
    }

    // If connection test passes, proceed with the actual query
    // Use tagged template literal for the query
    const result = await sql`
      SELECT * FROM "NistControl" 
      ORDER BY "lastUpdated" DESC
    `

    // Add console log for debugging
    console.log(`API: Retrieved ${result.length} controls from database`)

    return NextResponse.json(result)
  } catch (error) {
    // Enhanced error logging
    console.error("API: Error fetching controls:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        error: "Failed to fetch controls",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// POST to add new controls
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const controls = Array.isArray(data) ? data : [data]

    console.log(`API: Received request to add ${controls.length} controls`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    const insertedControls = []

    for (const control of controls) {
      const currentTime = new Date()

      // Use tagged template literal for the query
      const result = await sql`
        INSERT INTO "NistControl" (
          "nistFunction", 
          "nistCategoryId", 
          "nistSubCategoryId", 
          "assessmentPriority", 
          "controlDescription", 
          "cybersecurityDomain", 
          "meetsCriteria", 
          "identifiedRisks", 
          "riskDetails", 
          "remediationStatus", 
          "lastUpdated",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${control.nistFunction},
          ${control.nistCategoryId},
          ${control.nistSubCategoryId},
          ${control.assessmentPriority},
          ${control.controlDescription},
          ${control.cybersecurityDomain},
          ${control.meetsCriteria},
          ${control.identifiedRisks},
          ${control.riskDetails},
          ${control.remediationStatus},
          ${currentTime},
          ${currentTime},
          ${currentTime}
        )
        RETURNING *
      `

      insertedControls.push(result[0])
    }

    console.log(`API: Successfully inserted ${insertedControls.length} controls`)

    return NextResponse.json(insertedControls)
  } catch (error) {
    console.error("API: Error adding controls:", error)
    return NextResponse.json({ error: "Failed to add controls" }, { status: 500 })
  }
}

// DELETE to clear all controls
export async function DELETE() {
  try {
    console.log("API: Deleting all controls")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Use tagged template literal for the query
    await sql`DELETE FROM "NistControl"`

    console.log("API: Successfully deleted all controls from database")

    return NextResponse.json({ success: true, message: "All controls deleted successfully" })
  } catch (error) {
    console.error("API: Error clearing controls:", error)
    return NextResponse.json({ error: "Failed to clear controls" }, { status: 500 })
  }
}
