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

export interface ControlStats {
  totalControls: number
  compliantControls: number
  nonCompliantControls: number
  complianceRate: number
  highPriorityControls: number
  mediumPriorityControls: number
  lowPriorityControls: number
  notStartedControls: number
  inProgressControls: number
  completedControls: number
  functionDistribution: Record<string, number>
}

export interface DbInfo {
  isInitialized: boolean
  controlsCount: number
  lastUpdated: string | null
}
