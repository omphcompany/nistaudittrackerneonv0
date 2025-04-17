import { NextResponse } from "next/server"
import { getDatabaseInfo } from "@/lib/db-connection"

export const runtime = "nodejs"

export async function GET() {
  try {
    const dbInfo = await getDatabaseInfo()

    // Create a masked version of the connection URL for display
    let maskedUrl = ""

    if (process.env.DATABASE_URL) {
      // Parse the URL to mask sensitive parts
      const dbUrl = process.env.DATABASE_URL
      const urlParts = dbUrl.split("@")
      if (urlParts.length > 1) {
        const credentialsPart = urlParts[0]
        const hostPart = urlParts[1]

        // Mask the password in credentials
        const maskedCredentials = credentialsPart.replace(/:([^:]+)@/, ":********@")

        maskedUrl = `${maskedCredentials}@${hostPart}`
      }
    } else if (process.env.POSTGRES_URL) {
      maskedUrl = "Connected via POSTGRES_URL (credentials masked)"
    } else {
      maskedUrl = `Connected to ${process.env.PGHOST || process.env.POSTGRES_HOST} (credentials masked)`
    }

    return NextResponse.json({
      ...dbInfo,
      maskedUrl,
    })
  } catch (error) {
    console.error("Error getting database info:", error)
    return NextResponse.json({ error: "Failed to get database info" }, { status: 500 })
  }
}
