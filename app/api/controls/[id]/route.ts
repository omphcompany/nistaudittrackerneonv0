import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db-connection"

// Mark this file as server-side only
export const runtime = "nodejs"

// GET a specific control by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API: Fetching control with ID ${id}`)

    const result = await executeQuery(`SELECT * FROM "NistControl" WHERE id = $1`, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("API: Error fetching control:", error)
    return NextResponse.json({ error: "Failed to fetch control" }, { status: 500 })
  }
}

// PUT to update a specific control
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()
    console.log(`API: Updating control with ID ${id}`)

    const currentTime = new Date()

    const result = await executeQuery(
      `UPDATE "NistControl" SET
        "nistFunction" = $1,
        "nistCategoryId" = $2,
        "nistSubCategoryId" = $3,
        "assessmentPriority" = $4,
        "controlDescription" = $5,
        "cybersecurityDomain" = $6,
        "meetsCriteria" = $7,
        "identifiedRisks" = $8,
        "riskDetails" = $9,
        "remediationStatus" = $10,
        "lastUpdated" = $11,
        "updatedAt" = $12
      WHERE id = $13
      RETURNING *`,
      [
        data.nistFunction,
        data.nistCategoryId,
        data.nistSubCategoryId,
        data.assessmentPriority,
        data.controlDescription,
        data.cybersecurityDomain,
        data.meetsCriteria,
        data.identifiedRisks,
        data.riskDetails,
        data.remediationStatus,
        currentTime,
        currentTime,
        id,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    console.log(`API: Successfully updated control with ID ${id}`)
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("API: Error updating control:", error)
    return NextResponse.json({ error: "Failed to update control" }, { status: 500 })
  }
}

// DELETE a specific control
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API: Deleting control with ID ${id}`)

    const result = await executeQuery(`DELETE FROM "NistControl" WHERE id = $1 RETURNING *`, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    console.log(`API: Successfully deleted control with ID ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Error deleting control:", error)
    return NextResponse.json({ error: "Failed to delete control" }, { status: 500 })
  }
}
