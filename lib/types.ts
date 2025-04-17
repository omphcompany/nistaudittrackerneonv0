// NIST Control type definition
export interface NistControl {
  id?: number
  nist_function: string
  category: string
  subcategory: string
  title: string
  description: string
  priority: string
  status: string
  compliance_level: number
  implementation_notes: string
  created_at?: Date
  updated_at?: Date
  control_id: string
  cybersecurityDomain?: string
  meetsCriteria?: string
  identifiedRisks?: string
  riskDetails?: string
  remediationStatus?: string
}

export type Control = NistControl
