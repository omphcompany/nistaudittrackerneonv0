import type { NistControl } from "./types"

// Function to generate sample NIST controls data
export function loadSampleData(): NistControl[] {
  console.log("Loading sample data...")

  // Generate a timestamp to make each batch of sample data unique
  const timestamp = new Date()

  // Generate a random suffix to ensure uniqueness
  const randomSuffix = Math.floor(Math.random() * 10000)

  // Owners
  const owners = ["Contoso Corporation", "Acme Corporation"]

  // NIST Functions
  const nistFunctions = ["Govern (GV)", "Identify (ID)", "Protect (PR)", "Detect (DE)", "Respond (RS)", "Recover (RC)"]

  // NIST Categories
  const nistCategories = [
    { function: "Govern (GV)", id: "GV.1", name: "Cybersecurity Risk Management Strategy" },
    { function: "Govern (GV)", id: "GV.2", name: "Risk Management Processes" },
    { function: "Govern (GV)", id: "GV.3", name: "Supply Chain Risk Management" },
    { function: "Identify (ID)", id: "ID.1", name: "Asset Management" },
    { function: "Identify (ID)", id: "ID.2", name: "Business Environment" },
    { function: "Identify (ID)", id: "ID.3", name: "Risk Assessment" },
    { function: "Protect (PR)", id: "PR.1", name: "Identity Management and Access Control" },
    { function: "Protect (PR)", id: "PR.2", name: "Data Security" },
    { function: "Protect (PR)", id: "PR.3", name: "Information Protection Processes and Procedures" },
    { function: "Detect (DE)", id: "DE.1", name: "Anomalies and Events" },
    { function: "Detect (DE)", id: "DE.2", name: "Security Continuous Monitoring" },
    { function: "Respond (RS)", id: "RS.1", name: "Response Planning" },
    { function: "Respond (RS)", id: "RS.2", name: "Communications" },
    { function: "Recover (RC)", id: "RC.1", name: "Recovery Planning" },
    { function: "Recover (RC)", id: "RC.2", name: "Improvements" },
  ]

  // NIST Subcategories
  const nistSubcategories = [
    {
      category: "GV.1",
      id: "GV.1.1",
      description: "Establish and communicate cybersecurity risk management priorities",
    },
    { category: "GV.1", id: "GV.1.2", description: "Establish and maintain cybersecurity roles and responsibilities" },
    { category: "GV.2", id: "GV.2.1", description: "Establish and maintain cybersecurity risk management processes" },
    { category: "ID.1", id: "ID.1.1", description: "Inventory physical devices and systems" },
    { category: "ID.1", id: "ID.1.2", description: "Inventory software platforms and applications" },
    { category: "ID.2", id: "ID.2.1", description: "Identify and communicate priorities for organizational mission" },
    { category: "PR.1", id: "PR.1.1", description: "Establish and maintain identities and credentials" },
    { category: "PR.1", id: "PR.1.2", description: "Manage and control physical access to assets" },
    { category: "PR.2", id: "PR.2.1", description: "Protect data-at-rest" },
    { category: "PR.2", id: "PR.2.2", description: "Protect data-in-transit" },
    { category: "DE.1", id: "DE.1.1", description: "Establish and maintain a baseline of network operations" },
    { category: "DE.2", id: "DE.2.1", description: "Monitor the network and information systems" },
    { category: "RS.1", id: "RS.1.1", description: "Execute response processes and procedures" },
    { category: "RS.2", id: "RS.2.1", description: "Coordinate with stakeholders during response" },
    { category: "RC.1", id: "RC.1.1", description: "Execute recovery processes and procedures" },
    { category: "RC.2", id: "RC.2.1", description: "Incorporate lessons learned into recovery strategy" },
  ]

  // Cybersecurity domains
  const domains = [
    "Network Security",
    "Application Security",
    "Cloud Security",
    "Data Protection",
    "Identity and Access Management",
    "Security Operations",
    "Incident Response",
    "Business Continuity",
    "Risk Management",
    "Compliance",
  ]

  // Assessment priorities
  const priorities = ["High", "Medium", "Low"]

  // Remediation statuses
  const remediationStatuses = ["Not Started", "In Progress", "Completed"]

  // Generate sample controls
  const sampleControls: NistControl[] = []

  // Generate exactly 50 sample controls, 25 for each owner
  for (let i = 0; i < 50; i++) {
    // Alternate between owners to ensure equal distribution
    const owner = owners[i % 2]

    // Select random values for each field
    const nistFunction = nistFunctions[Math.floor(Math.random() * nistFunctions.length)]

    // Filter categories by the selected function
    const functionCategories = nistCategories.filter((cat) => cat.function === nistFunction)
    const category = functionCategories[Math.floor(Math.random() * functionCategories.length)]

    // Filter subcategories by the selected category
    const categorySubcategories = nistSubcategories.filter((subcat) => subcat.category === category.id)
    const subcategory =
      categorySubcategories.length > 0
        ? categorySubcategories[Math.floor(Math.random() * categorySubcategories.length)]
        : { id: `${category.id}.1`, description: `Sample subcategory for ${category.id}` }

    const domain = domains[Math.floor(Math.random() * domains.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const meetsCriteria = Math.random() > 0.5 ? "Yes" : "No"
    const remediationStatus = remediationStatuses[Math.floor(Math.random() * remediationStatuses.length)]

    // Create a control with a unique ID based on timestamp and random suffix
    sampleControls.push({
      id: i + 1 + randomSuffix * 1000, // Ensure unique IDs across sample data loads
      owner, // Add owner information
      nistFunction,
      nistCategoryId: `${category.id} - ${category.name}`,
      nistSubCategoryId: `${subcategory.id} - ${i}`, // Add index to ensure uniqueness
      assessmentPriority: priority as "High" | "Medium" | "Low",
      controlDescription: `${subcategory.description} - Batch ${randomSuffix}`, // Add batch number to description
      cybersecurityDomain: domain,
      meetsCriteria: meetsCriteria as "Yes" | "No",
      identifiedRisks: meetsCriteria === "No" ? `Sample risk for ${subcategory.id} - ${timestamp.toISOString()}` : "",
      riskDetails:
        meetsCriteria === "No" ? `Detailed risk information for ${subcategory.id} - ${timestamp.toISOString()}` : "",
      remediationStatus: remediationStatus as "Not Started" | "In Progress" | "Completed",
      lastUpdated: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }

  console.log(`Generated ${sampleControls.length} sample controls with timestamp ${timestamp.toISOString()}`)
  console.log(
    `Owner distribution: Contoso Corporation: ${sampleControls.filter((c) => c.owner === "Contoso Corporation").length}, Acme Corporation: ${sampleControls.filter((c) => c.owner === "Acme Corporation").length}`,
  )

  return sampleControls
}

// Function to parse the full dataset from a text format
export function parseFullDataset(text: string): NistControl[] {
  const lines = text.trim().split("\n")
  // Skip header row
  const dataLines = lines.slice(1)

  return dataLines.map((line) => {
    const columns = line.split("\t")

    return {
      owner: columns[0] || "Unknown", // Add owner field
      nistFunction: columns[1] || "",
      nistCategoryId: columns[2] || "",
      nistSubCategoryId: columns[3] || "",
      assessmentPriority: (columns[4] || "Medium") as "High" | "Medium" | "Low",
      controlDescription: columns[5] || "",
      cybersecurityDomain: columns[6] || "",
      meetsCriteria: (columns[7] || "No") as "Yes" | "No",
      identifiedRisks: columns[8] || "",
      riskDetails: columns[9] || "",
      remediationStatus: (columns[10] || "Not Started") as "Not Started" | "In Progress" | "Completed",
      lastUpdated: new Date(),
    }
  })
}

// Function to generate sample NIST control data for testing
export function generateSampleData(): NistControl[] {
  // Sample NIST Functions
  const nistFunctions = ["ID", "PR", "DE", "RS", "RC", "GV"]

  // Owners
  const owners = ["Contoso Corporation", "Acme Corporation"]

  // Sample Cybersecurity Domains
  const domains = [
    "Access Control",
    "Asset Management",
    "Audit and Accountability",
    "Security Assessment",
    "Configuration Management",
    "Identification and Authentication",
    "Incident Response",
    "Maintenance",
    "Risk Assessment",
    "System and Communications Protection",
  ]

  // Sample data for NIST controls
  const sampleData: NistControl[] = []

  // Generate sample data for each NIST function
  nistFunctions.forEach((func, funcIndex) => {
    // Generate categories for each function
    for (let catIndex = 1; catIndex <= 3; catIndex++) {
      const categoryId = `${func}.${catIndex}`

      // Generate subcategories for each category
      for (let subIndex = 1; subIndex <= 5; subIndex++) {
        const subCategoryId = `${categoryId}.${subIndex}`

        // Alternate between owners to ensure equal distribution
        const owner = owners[(funcIndex + catIndex + subIndex) % 2]

        // Determine compliance and remediation status with some variation
        const meetsCriteria = Math.random() > 0.4 ? "Yes" : "No"
        let remediationStatus: "Not Started" | "In Progress" | "Completed"

        if (meetsCriteria === "Yes") {
          remediationStatus = "Completed"
        } else {
          remediationStatus = Math.random() > 0.5 ? "In Progress" : "Not Started"
        }

        // Determine priority with some variation
        let assessmentPriority: "High" | "Medium" | "Low"
        const priorityRand = Math.random()
        if (priorityRand < 0.3) {
          assessmentPriority = "High"
        } else if (priorityRand < 0.7) {
          assessmentPriority = "Medium"
        } else {
          assessmentPriority = "Low"
        }

        // Select a random domain
        const domain = domains[Math.floor(Math.random() * domains.length)]

        // Create the control object
        const control: NistControl = {
          owner, // Add owner information
          nistFunction: func,
          nistCategoryId: `${func}.${catIndex} - ${getFunctionName(func)} Category ${catIndex}`,
          nistSubCategoryId: subCategoryId,
          assessmentPriority,
          controlDescription: `This is a sample control for ${subCategoryId} that demonstrates ${getFunctionName(func)} capabilities.`,
          cybersecurityDomain: domain,
          meetsCriteria,
          identifiedRisks: meetsCriteria === "No" ? `Sample risk for ${subCategoryId}` : "",
          riskDetails: meetsCriteria === "No" ? `Detailed explanation of risk for ${subCategoryId}` : "",
          remediationStatus,
          lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
        }

        sampleData.push(control)
      }
    }
  })

  return sampleData
}

// Helper function to get the full name of a NIST function
function getFunctionName(functionCode: string): string {
  const functionNames: Record<string, string> = {
    ID: "Identify",
    PR: "Protect",
    DE: "Detect",
    RS: "Respond",
    RC: "Recover",
    GV: "Govern",
  }

  return functionNames[functionCode] || functionCode
}
