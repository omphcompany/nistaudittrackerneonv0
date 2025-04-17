import { read, utils } from "xlsx"
import type { NistControl } from "./types"

export async function parseExcelFile(file: File): Promise<NistControl[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        if (!e.target || !e.target.result) {
          throw new Error("Failed to read file")
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer)
        const workbook = read(data, { type: "array" })

        // Assume first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          throw new Error("Excel file has no sheets")
        }

        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = utils.sheet_to_json(worksheet)
        console.log("Parsed Excel data:", jsonData.length, "rows")

        if (jsonData.length === 0) {
          throw new Error("No data found in Excel file")
        }

        // Current timestamp for all date fields
        const currentTime = new Date()

        // Map to our data structure
        const controls: NistControl[] = jsonData.map((row: any) => ({
          nistFunction: row["NIST Function"] || "",
          nistCategoryId: row["NIST Category & ID"] || "",
          nistSubCategoryId: row["NIST Sub-Category & ID"] || "",
          assessmentPriority: row["Assessment Priority"] || "Medium",
          controlDescription: row["Control Description"] || "",
          cybersecurityDomain: row["Cybersecurity Domain"] || "",
          meetsCriteria: row["Meets Criteria (Yes/No)"] || "No",
          identifiedRisks: row["Identified Risks"] || "",
          riskDetails: row["Risk Details"] || "",
          remediationStatus: row["Remediation Status"] || "Not Started",
          lastUpdated: currentTime,
          createdAt: currentTime,
          updatedAt: currentTime,
        }))

        console.log("Mapped to", controls.length, "control objects")
        resolve(controls)
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        reject(error)
      }
    }

    reader.onerror = (error) => {
      console.error("FileReader error:", error)
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}

export function exportToExcel(controls: NistControl[]): void {
  // Convert controls to worksheet data
  const worksheet = utils.json_to_sheet(
    controls.map((control) => ({
      "NIST Function": control.nistFunction,
      "NIST Category & ID": control.nistCategoryId,
      "NIST Sub-Category & ID": control.nistSubCategoryId,
      "Assessment Priority": control.assessmentPriority,
      "Control Description": control.controlDescription,
      "Cybersecurity Domain": control.cybersecurityDomain,
      "Meets Criteria (Yes/No)": control.meetsCriteria,
      "Identified Risks": control.identifiedRisks,
      "Risk Details": control.riskDetails,
      "Remediation Status": control.remediationStatus,
      "Last Updated": control.lastUpdated.toISOString().split("T")[0],
    })),
  )

  // Create workbook and add worksheet
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, "NIST Controls")

  // Generate Excel file and trigger download
  utils.writeFile(workbook, "nist_controls_export.xlsx")
}
