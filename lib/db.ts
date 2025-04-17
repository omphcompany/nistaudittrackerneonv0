// Browser-based database service
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
}

class DatabaseService {
  private dbName = "nistControlsDB"
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private isInitializing = false
  private initPromise: Promise<boolean> | null = null

  async init(): Promise<boolean> {
    // If already initialized, return true
    if (this.db) return true

    // If already initializing, return the existing promise
    if (this.isInitializing && this.initPromise) {
      return this.initPromise
    }

    // Set initializing flag and create promise
    this.isInitializing = true
    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion)

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result

          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains("controls")) {
            const store = db.createObjectStore("controls", { keyPath: "id", autoIncrement: true })
            store.createIndex("nistFunction", "nistFunction", { unique: false })
            store.createIndex("remediationStatus", "remediationStatus", { unique: false })
            store.createIndex("assessmentPriority", "assessmentPriority", { unique: false })
          }
        }

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result
          this.isInitializing = false
          resolve(true)
        }

        request.onerror = (event) => {
          console.error("Database error:", (event.target as IDBOpenDBRequest).error)
          this.isInitializing = false
          reject(false)
        }
      } catch (error) {
        console.error("Error in init:", error)
        this.isInitializing = false
        reject(false)
      }
    })

    return this.initPromise
  }

  async addControls(controls: NistControl[]): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed to initialize database for addControls")
        return false
      }
    }

    try {
      // Add to IndexedDB
      return await this.addControlsToIndexedDB(controls)
    } catch (error) {
      console.error("Error adding controls:", error)
      return false
    }
  }

  private async addControlsToIndexedDB(controls: NistControl[]): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        throw new Error("Failed to initialize database for addControlsToIndexedDB")
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["controls"], "readwrite")
        const store = transaction.objectStore("controls")

        let successCount = 0

        controls.forEach((control) => {
          const request = store.add({
            ...control,
            lastUpdated: new Date(),
          })

          request.onsuccess = () => {
            successCount++
            if (successCount === controls.length) {
              resolve(true)
            }
          }

          request.onerror = (event) => {
            console.error("Error adding control:", (event.target as IDBRequest).error)
            reject(false)
          }
        })

        transaction.oncomplete = () => {
          resolve(true)
        }

        transaction.onerror = (event) => {
          console.error("Transaction error:", event)
          reject(false)
        }
      } catch (error) {
        console.error("Error in addControlsToIndexedDB:", error)
        reject(false)
      }
    })
  }

  async updateControl(control: NistControl): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed to initialize database for updateControl")
        return false
      }
    }

    try {
      // Update in IndexedDB
      return await this.updateControlInIndexedDB(control)
    } catch (error) {
      console.error("Error updating control:", error)
      return false
    }
  }

  private async updateControlInIndexedDB(control: NistControl): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        throw new Error("Failed to initialize database for updateControlInIndexedDB")
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["controls"], "readwrite")
        const store = transaction.objectStore("controls")

        const request = store.put({
          ...control,
          lastUpdated: new Date(),
        })

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event) => {
          console.error("Error updating control:", (event.target as IDBRequest).error)
          reject(false)
        }
      } catch (error) {
        console.error("Error in updateControlInIndexedDB:", error)
        reject(false)
      }
    })
  }

  async deleteControl(id: number): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed to initialize database for deleteControl")
        return false
      }
    }

    try {
      // Delete from IndexedDB
      return await this.deleteControlFromIndexedDB(id)
    } catch (error) {
      console.error("Error deleting control:", error)
      return false
    }
  }

  private async deleteControlFromIndexedDB(id: number): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        throw new Error("Failed to initialize database for deleteControlFromIndexedDB")
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["controls"], "readwrite")
        const store = transaction.objectStore("controls")

        const request = store.delete(id)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event) => {
          console.error("Error deleting control:", (event.target as IDBRequest).error)
          reject(false)
        }
      } catch (error) {
        console.error("Error in deleteControlFromIndexedDB:", error)
        reject(false)
      }
    })
  }

  async getAllControls(): Promise<NistControl[]> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed to initialize database for getAllControls")
        return []
      }
    }

    try {
      return this.getAllControlsFromIndexedDB()
    } catch (error) {
      console.error("Error getting controls:", error)
      return []
    }
  }

  private async getAllControlsFromIndexedDB(): Promise<NistControl[]> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        throw new Error("Failed to initialize database for getAllControlsFromIndexedDB")
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["controls"], "readonly")
        const store = transaction.objectStore("controls")

        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = (event) => {
          console.error("Error getting controls:", (event.target as IDBRequest).error)
          reject([])
        }
      } catch (error) {
        console.error("Error in getAllControlsFromIndexedDB:", error)
        reject([])
      }
    })
  }

  async getControlsByFunction(nistFunction: string): Promise<NistControl[]> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed to initialize database for getControlsByFunction")
        return []
      }
    }

    // Get all controls and filter
    const allControls = await this.getAllControls()
    return allControls.filter((control) => control.nistFunction === nistFunction)
  }

  async getControlsByStatus(status: string): Promise<NistControl[]> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed to initialize database for getControlsByStatus")
        return []
      }
    }

    // Get all controls and filter
    const allControls = await this.getAllControls()
    return allControls.filter((control) => control.remediationStatus === status)
  }

  async clearAllData(): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        console.error("Failed toinitialize database for clearAllData")
        return false
      }
    }

    try {
      // Clear IndexedDB
      return await this.clearIndexedDB()
    } catch (error) {
      console.error("Error clearing data:", error)
      return false
    }
  }

  private async clearIndexedDB(): Promise<boolean> {
    // Ensure database is initialized
    if (!this.db) {
      await this.init()
      if (!this.db) {
        throw new Error("Failed to initialize database for clearIndexedDB")
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["controls"], "readwrite")
        const store = transaction.objectStore("controls")

        const request = store.clear()

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event) => {
          console.error("Error clearing data:", (event.target as IDBRequest).error)
          reject(false)
        }
      } catch (error) {
        console.error("Error in clearIndexedDB:", error)
        reject(false)
      }
    })
  }
}

// Singleton instance
export const dbService = new DatabaseService()
