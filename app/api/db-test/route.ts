import { NextResponse } from "next/server"
import { initDb, getDbInfo, getControls } from "@/lib/db-connection"

export async function GET() {
  try {
    // Initialize the database
    const isInitialized = await initDb()

    // Get database info
    const dbInfo = await getDbInfo()

    // Get a sample of controls (limit to 5 for the response)
    const controls = await getControls()
    const sampleControls = controls.slice(0, 5)

    return NextResponse.json({
      success: true,
      isInitialized,
      dbInfo,
      controlsCount: controls.length,
      sampleControls,
    })
  } catch (error) {
    console.error("Error in DB test API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test database connection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
