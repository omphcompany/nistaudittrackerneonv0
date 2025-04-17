export interface NistControl {
  id?: number
  owner: string // Added owner field
  nistFunction: string
  nistCategoryId: string
  nistSubCategoryId: string
  assessmentPriority: "High" | "Medium" | "Low"
  controlDescription: string
  cybersecurityDomain: string
  meetsCriteria: "Yes" | "No"
  identifiedRisks: string
  riskDetails: string
  remediationStatus: "Not Started" | "In Progress" | "Completed"
  lastUpdated: Date
  createdAt?: Date
  updatedAt?: Date
  compliance?: "Compliant" | "Non-Compliant" // Added compliance property
  priority?: "High" | "Medium" | "Low" // Added priority property
  status?: "Implemented" | "In Progress" | "Planned" | "Not Started" // Added status property
}

export type Control = NistControl // Added type alias for Control

export interface ExcelFile {
  id?: number
  filename: string
  description?: string
  fileSize: number
  uploadedAt: Date
  uploadedBy?: string
}
