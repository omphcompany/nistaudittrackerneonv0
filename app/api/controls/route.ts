import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { NistControl } from "@/lib/types"

export const runtime = "nodejs"

// Update the isAuthenticated helper function to be more robust
function isAuthenticated(request: Request) {
  const cookie = request.headers.get("cookie") || ""
  const hasAuthCookie = cookie.includes("auth=true") || cookie.includes("nistauth=true")
  const hasAuthHeader = request.headers.get("X-Auth-Status") === "true"

  console.log("API: Authentication check - Cookie:", cookie)
  console.log("API: Has auth cookie:", hasAuthCookie, "Has auth header:", hasAuthHeader)

  return hasAuthCookie || hasAuthHeader
}

export async function GET(request: Request) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      console.log("API: Authentication required for fetching controls")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("API: Fetching controls")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Fetch all controls
    const controls = await sql`SELECT * FROM "NistControl" ORDER BY "lastUpdated" DESC`

    console.log(`API: Successfully fetched ${controls.length} controls`)

    return NextResponse.json(controls)
  } catch (error) {
    console.error("API: Error fetching controls:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch controls",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      console.log("API: Authentication required for adding controls")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("API: Adding controls")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Parse the request body
    const controls: NistControl[] = await request.json()

    if (!Array.isArray(controls) || controls.length === 0) {
      return NextResponse.json({ error: "Invalid request body. Expected an array of controls." }, { status: 400 })
    }

    console.log(`API: Adding ${controls.length} controls`)

    // Insert each control
    const insertedControls = []
    for (const control of controls) {
      const result = await sql`
        INSERT INTO "NistControl" (
          "owner",
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
        ) 
        VALUES (
          ${control.owner || "Unknown"},
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
          ${control.lastUpdated ? new Date(control.lastUpdated) : new Date()},
          ${control.createdAt ? new Date(control.createdAt) : new Date()},
          ${control.updatedAt ? new Date(control.updatedAt) : new Date()}
        )
        RETURNING *
      `
      insertedControls.push(result[0])
    }

    console.log(`API: Successfully added ${insertedControls.length} controls`)

    return NextResponse.json({
      success: true,
      message: `Added ${insertedControls.length} controls`,
      controls: insertedControls,
    })
  } catch (error) {
    console.error("API: Error adding controls:", error)
    return NextResponse.json(
      {
        error: "Failed to add controls",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      console.log("API: Authentication required for clearing controls")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("API: Clearing all controls")

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Delete all controls
    const result = await sql`DELETE FROM "NistControl" RETURNING id`

    console.log(`API: Successfully deleted ${result.length} controls`)

    return NextResponse.json({
      success: true,
      message: "All controls deleted",
      deletedCount: result.length,
    })
  } catch (error) {
    console.error("API: Error clearing controls:", error)
    return NextResponse.json(
      {
        error: "Failed to clear controls",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
