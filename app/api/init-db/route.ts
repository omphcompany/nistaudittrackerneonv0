import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-connection"

export async function GET() {
  try {
    console.log("API route: Initializing database...")
    const success = await initializeDatabase()

    if (success) {
      return NextResponse.json({ success: true, message: "Database initialized successfully" })
    } else {
      return NextResponse.json({ success: false, error: "Failed to initialize database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in init-db API route:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
