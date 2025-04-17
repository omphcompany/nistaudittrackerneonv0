export interface NistControl {
  id?: number
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
}

export interface ExcelFile {
  id?: number
  filename: string
  description?: string
  fileSize: number
  uploadedAt: Date
  uploadedBy?: string
}
