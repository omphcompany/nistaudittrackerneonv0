import * as XLSX from "xlsx"
import type { NistControl } from "@/lib/types"

export async function parseExcelFile(file: File): Promise<NistControl[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Map to NistControl objects
        const controls: NistControl[] = jsonData.map((row: any) => {
          return {
            control_id:
              row["NIST Sub-Category & ID"] || `${row["NIST Function"]}.${Math.random().toString(36).substring(2, 7)}`,
            nist_function: row["NIST Function"],
            category: row["NIST Category & ID"],
            subcategory: row["NIST Sub-Category & ID"],
            title: row["Control Description"] || "Untitled Control",
            description: row["Control Description"],
            priority: row["Assessment Priority"] || "Medium",
            status: row["Remediation Status"] || "Not Started",
            compliance_level: row["Meets Criteria"] === "Yes" ? 100 : 0,
            implementation_notes: row["Risk Details"] || "",
          }
        })

        resolve(controls)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsBinaryString(file)
  })
}

export function exportToExcel(controls: NistControl[]) {
  // Convert controls to worksheet data
  const worksheetData = controls.map((control) => ({
    "NIST Function": control.nist_function,
    "NIST Category & ID": control.category,
    "NIST Sub-Category & ID": control.subcategory,
    "Assessment Priority": control.priority,
    "Control Description": control.description,
    "Cybersecurity Domain": control.category.split(" ")[0], // Simplified domain extraction
    "Meets Criteria": control.compliance_level === 100 ? "Yes" : "No",
    "Identified Risks": control.compliance_level < 100 ? "Yes" : "No",
    "Risk Details": control.implementation_notes,
    "Remediation Status": control.status,
  }))

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "NIST Controls")

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, "nist_controls_export.xlsx")
}
