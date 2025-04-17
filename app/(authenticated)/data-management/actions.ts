"use server"

import { loadSampleData } from "@/lib/sample-data"
import { revalidatePath } from "next/cache"

export async function loadSampleDataAction() {
  try {
    console.log("Server action: Loading sample data...")
    const sampleData = loadSampleData()
    console.log(`Generated ${sampleData.length} sample controls`)

    // Return the sample data to be processed on the client
    return { success: true, data: sampleData }
  } catch (error) {
    console.error("Error in loadSampleDataAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error loading sample data",
    }
  } finally {
    // Revalidate the data management page
    revalidatePath("/data-management")
  }
}
