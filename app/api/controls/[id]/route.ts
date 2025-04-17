import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { NistControl } from "@/lib/types"

export const runtime = "nodejs"

// Helper function to check authentication
function isAuthenticated(request: Request) {
  const cookie = request.headers.get("cookie") || ""
  return cookie.includes("auth=true")
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const id = params.id
    console.log(`API: Fetching control with ID ${id}`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Fetch the control
    const control = await sql`SELECT * FROM "NistControl" WHERE id = ${id}`

    if (control.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json(control[0])
  } catch (error) {
    console.error(`API: Error fetching control:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch control",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const id = params.id
    console.log(`API: Updating control with ID ${id}`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Parse the request body
    const control: NistControl = await request.json()

    // Update the control
    const result = await sql`
      UPDATE "NistControl" 
      SET 
        "owner" = ${control.owner || "Unknown"},
        "nistFunction" = ${control.nistFunction}, 
        "nistCategoryId" = ${control.nistCategoryId}, 
        "nistSubCategoryId" = ${control.nistSubCategoryId}, 
        "assessmentPriority" = ${control.assessmentPriority}, 
        "controlDescription" = ${control.controlDescription}, 
        "cybersecurityDomain" = ${control.cybersecurityDomain}, 
        "meetsCriteria" = ${control.meetsCriteria}, 
        "identifiedRisks" = ${control.identifiedRisks}, 
        "riskDetails" = ${control.riskDetails}, 
        "remediationStatus" = ${control.remediationStatus}, 
        "lastUpdated" = ${new Date()},
        "updatedAt" = ${new Date()}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Control updated",
      control: result[0],
    })
  } catch (error) {
    console.error(`API: Error updating control:`, error)
    return NextResponse.json(
      {
        error: "Failed to update control",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const id = params.id
    console.log(`API: Deleting control with ID ${id}`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Delete the control
    const result = await sql`DELETE FROM "NistControl" WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Control deleted",
      id: result[0].id,
    })
  } catch (error) {
    console.error(`API: Error deleting control:`, error)
    return NextResponse.json(
      {
        error: "Failed to delete control",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
