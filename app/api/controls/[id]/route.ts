import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Mark this file as server-side only
export const runtime = "nodejs"

// GET a specific control by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    console.log(`API: Fetching control with ID ${id}`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Use tagged template literal for the query
    const result = await sql`
      SELECT * FROM "NistControl" 
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error(`API: Error fetching control:`, error)
    return NextResponse.json({ error: "Failed to fetch control" }, { status: 500 })
  }
}

// PUT to update a control
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const control = await request.json()
    console.log(`API: Updating control with ID ${id}`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Use tagged template literal for the query
    const result = await sql`
      UPDATE "NistControl" 
      SET 
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
        "lastUpdated" = ${control.lastUpdated || new Date()},
        "updatedAt" = ${new Date()}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error(`API: Error updating control:`, error)
    return NextResponse.json({ error: "Failed to update control" }, { status: 500 })
  }
}

// DELETE a control
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    console.log(`API: Deleting control with ID ${id}`)

    // Get the database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "No database URL found in environment variables" }, { status: 500 })
    }

    // Create a new SQL client directly
    const sql = neon(databaseUrl)

    // Use tagged template literal for the query
    const result = await sql`
      DELETE FROM "NistControl" 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Control deleted successfully" })
  } catch (error) {
    console.error(`API: Error deleting control:`, error)
    return NextResponse.json({ error: "Failed to delete control" }, { status: 500 })
  }
}
