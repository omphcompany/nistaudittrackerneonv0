import type { NistControl } from "./types"

// Function to generate a random date within the last 30 days
function getRandomDate() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  return new Date(randomTime)
}

// Function to generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Function to load sample data
export function loadSampleData(): NistControl[] {
  console.log("Loading sample data...")

  // Define the owners
  const owners = ["Acme Corporation", "Contoso Corporation"]

  // Create an array to hold the sample controls
  const sampleControls: NistControl[] = []

  // Generate 50 sample controls with alternating owners
  for (let i = 0; i < 50; i++) {
    // Assign the first 25 controls to Acme Corporation and the next 25 to Contoso Corporation
    const owner = i < 25 ? owners[0] : owners[1]

    const control: NistControl = {
      id: generateId(),
      owner: owner,
      nistFunction: ["Identify", "Protect", "Detect", "Respond", "Recover"][Math.floor(Math.random() * 5)],
      nistCategoryId: `ID.${Math.floor(Math.random() * 10) + 1} - Asset Management`,
      nistSubCategoryId: `ID.AM-${Math.floor(Math.random() * 6) + 1} - Physical devices and systems are inventoried`,
      assessmentPriority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
      controlDescription: `Sample control description ${i + 1}. This is a placeholder for a detailed description of the control.`,
      cybersecurityDomain: [
        "Access Control",
        "Asset Management",
        "Data Protection",
        "Incident Response",
        "Risk Management",
      ][Math.floor(Math.random() * 5)],
      meetsCriteria: Math.random() > 0.5 ? "Yes" : "No",
      identifiedRisks:
        Math.random() > 0.5 ? "No significant risks identified" : "Several risks identified that need attention",
      riskDetails: Math.random() > 0.5 ? "" : "Details about the identified risks and their potential impact",
      remediationStatus: ["Not Started", "In Progress", "Completed"][Math.floor(Math.random() * 3)],
      lastUpdated: getRandomDate(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    sampleControls.push(control)
  }

  // Log the distribution of owners
  const acmeCount = sampleControls.filter((c) => c.owner === "Acme Corporation").length
  const contosoCount = sampleControls.filter((c) => c.owner === "Contoso Corporation").length
  console.log(`Generated ${sampleControls.length} sample controls:`)
  console.log(`- Acme Corporation: ${acmeCount} controls`)
  console.log(`- Contoso Corporation: ${contosoCount} controls`)

  return sampleControls
}

// Function to generate more detailed sample data
export function generateSampleData(): NistControl[] {
  const nistFunctions = [
    { id: "ID", name: "Identify" },
    { id: "PR", name: "Protect" },
    { id: "DE", name: "Detect" },
    { id: "RS", name: "Respond" },
    { id: "RC", name: "Recover" },
  ]

  const nistCategories = [
    { id: "ID.AM", name: "Asset Management" },
    { id: "ID.BE", name: "Business Environment" },
    { id: "ID.GV", name: "Governance" },
    { id: "ID.RA", name: "Risk Assessment" },
    { id: "ID.RM", name: "Risk Management Strategy" },
    { id: "ID.SC", name: "Supply Chain Risk Management" },
    { id: "PR.AC", name: "Identity Management and Access Control" },
    { id: "PR.AT", name: "Awareness and Training" },
    { id: "PR.DS", name: "Data Security" },
    { id: "PR.IP", name: "Information Protection Processes and Procedures" },
    { id: "PR.MA", name: "Maintenance" },
    { id: "PR.PT", name: "Protective Technology" },
    { id: "DE.AE", name: "Anomalies and Events" },
    { id: "DE.CM", name: "Security Continuous Monitoring" },
    { id: "DE.DP", name: "Detection Processes" },
    { id: "RS.RP", name: "Response Planning" },
    { id: "RS.CO", name: "Communications" },
    { id: "RS.AN", name: "Analysis" },
    { id: "RS.MI", name: "Mitigation" },
    { id: "RS.IM", name: "Improvements" },
    { id: "RC.RP", name: "Recovery Planning" },
    { id: "RC.IM", name: "Improvements" },
    { id: "RC.CO", name: "Communications" },
  ]

  const owners = ["Acme Corporation", "Contoso Corporation"]
  const domains = [
    "Access Control",
    "Asset Management",
    "Data Protection",
    "Incident Response",
    "Risk Management",
    "Vulnerability Management",
    "Security Governance",
    "Network Security",
    "Application Security",
    "Cloud Security",
  ]

  const controls: NistControl[] = []
  let acmeCount = 0
  let contosoCount = 0

  // Generate controls for each function and category
  nistFunctions.forEach((func, funcIndex) => {
    // Get categories for this function
    const funcCategories = nistCategories.filter((cat) => cat.id.startsWith(func.id))

    funcCategories.forEach((cat, catIndex) => {
      // Generate 1-3 subcategories for each category
      const subCatCount = Math.floor(Math.random() * 3) + 1

      for (let subIndex = 1; subIndex <= subCatCount; subIndex++) {
        // Determine the owner based on counts to ensure even distribution
        let owner
        if (acmeCount < 25 && (contosoCount >= 25 || Math.random() < 0.5)) {
          owner = owners[0]
          acmeCount++
        } else if (contosoCount < 25) {
          owner = owners[1]
          contosoCount++
        } else {
          // If we've already assigned 25 to each, skip this control
          continue
        }

        const subCatId = `${cat.id}-${subIndex}`
        const domain = domains[Math.floor(Math.random() * domains.length)]
        const priority = ["High", "Medium", "Low"][Math.floor(Math.random() * 3)]
        const meetsCriteria = Math.random() > 0.4 ? "Yes" : "No"
        const remediationStatus = ["Not Started", "In Progress", "Completed"][Math.floor(Math.random() * 3)]

        const control: NistControl = {
          id: generateId(),
          owner: owner,
          nistFunction: func.name,
          nistCategoryId: `${cat.id} - ${cat.name}`,
          nistSubCategoryId: `${subCatId} - ${cat.name} Subcategory ${subIndex}`,
          assessmentPriority: priority,
          controlDescription: `This control is part of the ${func.name} function and ${cat.name} category. It focuses on ${domain} aspects of cybersecurity.`,
          cybersecurityDomain: domain,
          meetsCriteria: meetsCriteria,
          identifiedRisks: meetsCriteria === "No" ? `Risks identified in ${domain} area` : "",
          riskDetails:
            meetsCriteria === "No"
              ? `Detailed analysis of risks in the ${domain} domain related to ${cat.name} controls.`
              : "",
          remediationStatus: remediationStatus,
          lastUpdated: getRandomDate(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        controls.push(control)
      }
    })
  })

  // Log the distribution of owners
  console.log(`Generated ${controls.length} detailed sample controls:`)
  console.log(`- Acme Corporation: ${acmeCount} controls`)
  console.log(`- Contoso Corporation: ${contosoCount} controls`)

  return controls
}
