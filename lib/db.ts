import type { NistControl, ControlStats, DbInfo } from "./types"
import { openDB } from "idb"

// Constants for database configuration
const DB_NAME = "nist-audit-tracker"
const DB_VERSION = 1
const CONTROLS_STORE = "controls"

// Initialize the database
export async function initDb() {
  console.log("Initializing IndexedDB database...")
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`)

        // Create the controls store if it doesn't exist
        if (!db.objectStoreNames.contains(CONTROLS_STORE)) {
          console.log(`Creating object store: ${CONTROLS_STORE}`)
          const store = db.createObjectStore(CONTROLS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          })

          // Create indexes for querying
          store.createIndex("nistFunction", "nistFunction")
          store.createIndex("remediationStatus", "remediationStatus")
          store.createIndex("assessmentPriority", "assessmentPriority")
          store.createIndex("meetsCriteria", "meetsCriteria")
          store.createIndex("lastUpdated", "lastUpdated")

          console.log(`Object store ${CONTROLS_STORE} created with indexes`)
        } else {
          console.log(`Object store ${CONTROLS_STORE} already exists`)
        }
      },
      blocked() {
        console.warn("Database upgrade was blocked by another open connection")
      },
      blocking() {
        console.warn("This connection is blocking a database upgrade")
      },
      terminated() {
        console.error("Database connection was terminated unexpectedly")
      },
    })

    console.log("Database initialized successfully:", db.name, "version:", db.version)
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// Check if database exists and is initialized
export async function checkDbExists(): Promise<boolean> {
  try {
    const databases = await window.indexedDB.databases()
    const exists = databases.some((db) => db.name === DB_NAME)
    console.log(`Database ${DB_NAME} exists: ${exists}`)
    return exists
  } catch (error) {
    console.error("Error checking if database exists:", error)
    return false
  }
}

// Add controls to the database
export async function addControls(controls: NistControl[]) {
  console.log(`Adding ${controls.length} controls to database...`)
  try {
    // First ensure the database is initialized
    await initDb()

    const db = await openDB(DB_NAME, DB_VERSION)
    const tx = db.transaction(CONTROLS_STORE, "readwrite")
    const store = tx.objectStore(CONTROLS_STORE)

    // Add each control to the store
    for (const control of controls) {
      await store.add({
        ...control,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await tx.done
    console.log(`Added ${controls.length} controls successfully`)
    return true
  } catch (error) {
    console.error("Error adding controls:", error)
    return false
  }
}

// Get all controls from the database
export async function getControls(): Promise<NistControl[]> {
  console.log("Getting all controls from database...")
  try {
    // First check if database exists
    const exists = await checkDbExists()
    if (!exists) {
      console.log("Database doesn't exist yet, initializing...")
      await initDb()
    }

    const db = await openDB(DB_NAME, DB_VERSION)

    // Check if the store exists
    if (!db.objectStoreNames.contains(CONTROLS_STORE)) {
      console.error(`Object store ${CONTROLS_STORE} not found in database`)
      return []
    }

    const tx = db.transaction(CONTROLS_STORE, "readonly")
    const store = tx.objectStore(CONTROLS_STORE)
    const controls = await store.getAll()
    console.log(`Retrieved ${controls.length} controls`)
    return controls
  } catch (error) {
    console.error("Error getting controls:", error)
    return []
  }
}

// Get a control by ID
export async function getControlById(id: number): Promise<NistControl | null> {
  try {
    // First ensure the database is initialized
    await initDb()

    const db = await openDB(DB_NAME, DB_VERSION)
    const tx = db.transaction(CONTROLS_STORE, "readonly")
    const store = tx.objectStore(CONTROLS_STORE)
    const control = await store.get(id)
    return control || null
  } catch (error) {
    console.error(`Error getting control with ID ${id}:`, error)
    return null
  }
}

// Update a control
export async function updateControl(control: NistControl): Promise<boolean> {
  try {
    // First ensure the database is initialized
    await initDb()

    const db = await openDB(DB_NAME, DB_VERSION)
    const tx = db.transaction(CONTROLS_STORE, "readwrite")
    const store = tx.objectStore(CONTROLS_STORE)

    // Make sure the control has an ID
    if (!control.id) {
      console.error("Cannot update control without an ID")
      return false
    }

    // Update the control
    await store.put({
      ...control,
      updatedAt: new Date(),
    })

    await tx.done
    return true
  } catch (error) {
    console.error("Error updating control:", error)
    return false
  }
}

// Delete a control
export async function deleteControl(id: number): Promise<boolean> {
  try {
    // First ensure the database is initialized
    await initDb()

    const db = await openDB(DB_NAME, DB_VERSION)
    const tx = db.transaction(CONTROLS_STORE, "readwrite")
    const store = tx.objectStore(CONTROLS_STORE)
    await store.delete(id)
    await tx.done
    return true
  } catch (error) {
    console.error(`Error deleting control with ID ${id}:`, error)
    return false
  }
}

// Clear all data
export async function clearAllData(): Promise<boolean> {
  try {
    // First ensure the database is initialized
    await initDb()

    const db = await openDB(DB_NAME, DB_VERSION)
    const tx = db.transaction(CONTROLS_STORE, "readwrite")
    const store = tx.objectStore(CONTROLS_STORE)
    await store.clear()
    await tx.done
    console.log("All data cleared successfully")
    return true
  } catch (error) {
    console.error("Error clearing data:", error)
    return false
  }
}

// Get database information
export async function getDbInfo(): Promise<DbInfo> {
  try {
    // First check if database exists
    const exists = await checkDbExists()
    if (!exists) {
      return {
        isInitialized: false,
        controlsCount: 0,
        lastUpdated: null,
      }
    }

    const db = await openDB(DB_NAME, DB_VERSION)

    // Check if the store exists
    if (!db.objectStoreNames.contains(CONTROLS_STORE)) {
      return {
        isInitialized: false,
        controlsCount: 0,
        lastUpdated: null,
      }
    }

    const tx = db.transaction(CONTROLS_STORE, "readonly")
    const store = tx.objectStore(CONTROLS_STORE)

    // Get the count of controls
    const count = await store.count()

    // Get the most recent control to determine last updated
    const index = store.index("lastUpdated")
    const controls = await index.getAll(undefined, 1)
    const lastUpdated = controls.length > 0 ? controls[0].lastUpdated : null

    return {
      isInitialized: true,
      controlsCount: count,
      lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
    }
  } catch (error) {
    console.error("Error getting database info:", error)
    return {
      isInitialized: false,
      controlsCount: 0,
      lastUpdated: null,
    }
  }
}

// Calculate control statistics
export async function getControlStats(): Promise<ControlStats> {
  try {
    const controls = await getControls()

    // Default stats
    const stats: ControlStats = {
      totalControls: controls.length,
      compliantControls: 0,
      nonCompliantControls: 0,
      complianceRate: 0,
      highPriorityControls: 0,
      mediumPriorityControls: 0,
      lowPriorityControls: 0,
      notStartedControls: 0,
      inProgressControls: 0,
      completedControls: 0,
      functionDistribution: {},
    }

    // Calculate stats from controls
    controls.forEach((control) => {
      // Compliance stats
      if (control.meetsCriteria === "Yes") {
        stats.compliantControls++
      } else {
        stats.nonCompliantControls++
      }

      // Priority stats
      if (control.assessmentPriority === "High") {
        stats.highPriorityControls++
      } else if (control.assessmentPriority === "Medium") {
        stats.mediumPriorityControls++
      } else if (control.assessmentPriority === "Low") {
        stats.lowPriorityControls++
      }

      // Remediation stats
      if (control.remediationStatus === "Not Started") {
        stats.notStartedControls++
      } else if (control.remediationStatus === "In Progress") {
        stats.inProgressControls++
      } else if (control.remediationStatus === "Completed") {
        stats.completedControls++
      }

      // Function distribution
      const func = control.nistFunction.split(" ")[0] // Extract the function name
      stats.functionDistribution[func] = (stats.functionDistribution[func] || 0) + 1
    })

    // Calculate compliance rate
    stats.complianceRate =
      stats.totalControls > 0 ? Math.round((stats.compliantControls / stats.totalControls) * 100) : 0

    return stats
  } catch (error) {
    console.error("Error calculating control stats:", error)
    return {
      totalControls: 0,
      compliantControls: 0,
      nonCompliantControls: 0,
      complianceRate: 0,
      highPriorityControls: 0,
      mediumPriorityControls: 0,
      lowPriorityControls: 0,
      notStartedControls: 0,
      inProgressControls: 0,
      completedControls: 0,
      functionDistribution: {},
    }
  }
}
