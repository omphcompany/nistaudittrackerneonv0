import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db-connection"

// Mark this file as server-side only
export const runtime = "nodejs"

// GET all controls
export async function GET() {
  try {
    console.log("API: Fetching all controls")

    // Add a database connection test first
    try {
      const connectionTest = await executeQuery("SELECT 1 as connection_test")
      console.log("Database connection test:", connectionTest.rows)
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
    const result = await executeQuery(`
      SELECT * FROM "NistControl" 
      ORDER BY "lastUpdated" DESC
    `)

    // Add console log for debugging
    console.log(`API: Retrieved ${result.rows.length} controls from database`)

    return NextResponse.json(result.rows)
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

    const insertedControls = []

    for (const control of controls) {
      const currentTime = new Date()

      const result = await executeQuery(
        `INSERT INTO "NistControl" (
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          control.nistFunction,
          control.nistCategoryId,
          control.nistSubCategoryId,
          control.assessmentPriority,
          control.controlDescription,
          control.cybersecurityDomain,
          control.meetsCriteria,
          control.identifiedRisks,
          control.riskDetails,
          control.remediationStatus,
          currentTime,
          currentTime,
          currentTime,
        ],
      )

      insertedControls.push(result.rows[0])
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
    await executeQuery('DELETE FROM "NistControl"')

    console.log("API: Successfully deleted all controls from database")

    return NextResponse.json({ success: true, message: "All controls deleted successfully" })
  } catch (error) {
    console.error("API: Error clearing controls:", error)
    return NextResponse.json({ error: "Failed to clear controls" }, { status: 500 })
  }
}
