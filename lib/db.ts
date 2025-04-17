import { executeQuery } from "./db-connection"
import type { NistControl } from "./types"

// Function to get all controls
export async function getControls(): Promise<NistControl[]> {
  try {
    const result = await executeQuery(`
      SELECT * FROM "NistControl"
      ORDER BY "nistFunction", "nistSubCategoryId"
    `)
    return result.rows.map((row: any) => ({
      control_id: row.nistSubCategoryId,
      nist_function: row.nistFunction,
      category: row.nistCategoryId,
      subcategory: row.nistSubCategoryId,
      title: row.controlDescription,
      description: row.controlDescription,
      priority: row.assessmentPriority,
      status: row.remediationStatus,
      compliance_level: row.meetsCriteria === "Yes" ? 100 : 0,
      implementation_notes: row.riskDetails,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    }))
  } catch (error) {
    console.error("Error fetching controls:", error)
    throw new Error("Failed to fetch controls")
  }
}

// Function to add controls
export async function addControls(controls: NistControl[]): Promise<boolean> {
  try {
    // Begin transaction
    await executeQuery("BEGIN")

    for (const control of controls) {
      await executeQuery(
        `
        INSERT INTO "NistControl" (
          "nistFunction", "nistCategoryId", "nistSubCategoryId", 
          "assessmentPriority", "controlDescription", "cybersecurityDomain", 
          "meetsCriteria", "identifiedRisks", "riskDetails", "remediationStatus"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        ON CONFLICT ("nistSubCategoryId") DO UPDATE SET
          "nistFunction" = $1,
          "nistCategoryId" = $2,
          "assessmentPriority" = $4,
          "controlDescription" = $5,
          "cybersecurityDomain" = $6,
          "meetsCriteria" = $7,
          "identifiedRisks" = $8,
          "riskDetails" = $9,
          "remediationStatus" = $10,
          "updatedAt" = CURRENT_TIMESTAMP
      `,
        [
          control.nist_function,
          control.category,
          control.subcategory || control.control_id,
          control.priority || "Medium",
          control.description || control.title,
          control.category.split(" ")[0], // Simplified domain extraction
          control.compliance_level === 100 ? "Yes" : "No",
          control.compliance_level < 100 ? "Yes" : "No",
          control.implementation_notes || "",
          control.status || "Not Started",
        ],
      )
    }

    // Commit transaction
    await executeQuery("COMMIT")
    return true
  } catch (error) {
    // Rollback on error
    await executeQuery("ROLLBACK")
    console.error("Error adding controls:", error)
    throw new Error("Failed to add controls")
  }
}

// Function to update a control
export async function updateControl(control: NistControl): Promise<boolean> {
  try {
    await executeQuery(
      `
      UPDATE "NistControl" SET
        "nistFunction" = $1,
        "nistCategoryId" = $2,
        "assessmentPriority" = $3,
        "controlDescription" = $4,
        "meetsCriteria" = $5,
        "riskDetails" = $6,
        "remediationStatus" = $7,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "nistSubCategoryId" = $8
    `,
      [
        control.nist_function,
        control.category,
        control.priority || "Medium",
        control.description || control.title,
        control.compliance_level === 100 ? "Yes" : "No",
        control.implementation_notes || "",
        control.status || "Not Started",
        control.control_id,
      ],
    )
    return true
  } catch (error) {
    console.error("Error updating control:", error)
    throw new Error("Failed to update control")
  }
}

// Function to clear all data
export async function clearAllData(): Promise<boolean> {
  try {
    await executeQuery('TRUNCATE TABLE "NistControl"')
    return true
  } catch (error) {
    console.error("Error clearing data:", error)
    throw new Error("Failed to clear data")
  }
}
