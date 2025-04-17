"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Control } from "@/lib/types"

// Define polling interval (120 seconds = 120000 ms)
const POLLING_INTERVAL = 120000

type DataContextType = {
  controls: Control[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  addControls: (controls: Control[]) => Promise<boolean>
  updateControl: (control: Control) => Promise<boolean>
  deleteControl: (id: number) => Promise<boolean>
  clearAllData: () => Promise<boolean>
  lastRefreshTime: Date | null
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  const refreshData = useCallback(async () => {
    // Skip refresh if it's been less than 1 minute since the last refresh
    if (lastRefreshTime && new Date().getTime() - lastRefreshTime.getTime() < 60000) {
      console.log("Skipping refresh - too soon since last refresh")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching controls data...")
      const startTime = performance.now()

      const response = await fetch("/api/controls")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error fetching controls:", errorData)
        throw new Error(errorData.error || "Failed to fetch controls")
      }

      const data = await response.json()
      const endTime = performance.now()

      console.log(`Fetched ${data.length} controls in ${(endTime - startTime).toFixed(2)}ms`)
      setControls(data)
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error("Error in refreshData:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [lastRefreshTime])

  const addControls = useCallback(
    async (newControls: Control[]): Promise<boolean> => {
      try {
        console.log(`Adding ${newControls.length} controls...`)
        const startTime = performance.now()

        const response = await fetch("/api/controls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newControls),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error adding controls:", errorData)
          throw new Error(errorData.error || "Failed to add controls")
        }

        const endTime = performance.now()
        console.log(`Added controls in ${(endTime - startTime).toFixed(2)}ms`)

        await refreshData()
        return true
      } catch (err) {
        console.error("Error in addControls:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        return false
      }
    },
    [refreshData],
  )

  const updateControl = useCallback(
    async (control: Control): Promise<boolean> => {
      try {
        console.log(`Updating control ${control.id}...`)
        const startTime = performance.now()

        const response = await fetch(`/api/controls/${control.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(control),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error updating control:", errorData)
          throw new Error(errorData.error || "Failed to update control")
        }

        const endTime = performance.now()
        console.log(`Updated control in ${(endTime - startTime).toFixed(2)}ms`)

        await refreshData()
        return true
      } catch (err) {
        console.error("Error in updateControl:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        return false
      }
    },
    [refreshData],
  )

  const deleteControl = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        console.log(`Deleting control ${id}...`)
        const startTime = performance.now()

        const response = await fetch(`/api/controls/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error deleting control:", errorData)
          throw new Error(errorData.error || "Failed to delete control")
        }

        const endTime = performance.now()
        console.log(`Deleted control in ${(endTime - startTime).toFixed(2)}ms`)

        await refreshData()
        return true
      } catch (err) {
        console.error("Error in deleteControl:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        return false
      }
    },
    [refreshData],
  )

  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Clearing all controls data...")
      const startTime = performance.now()

      // Get current count before deletion
      const currentCount = controls.length
      console.log(`Current control count before deletion: ${currentCount}`)

      const response = await fetch("/api/controls", {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error clearing data:", errorData)
        throw new Error(errorData.error || "Failed to clear data")
      }

      const result = await response.json()
      const endTime = performance.now()

      console.log(`Cleared ${result.deletedCount} controls in ${(endTime - startTime).toFixed(2)}ms`)

      // Force a refresh to update the UI
      await refreshData()
      return true
    } catch (err) {
      console.error("Error in clearAllData:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      return false
    }
  }, [controls.length, refreshData])

  useEffect(() => {
    refreshData()

    // Set up polling for real-time updates (every 120 seconds)
    const intervalId = setInterval(() => {
      console.log("Polling for data updates...")
      refreshData()
    }, POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [refreshData])

  return (
    <DataContext.Provider
      value={{
        controls,
        loading,
        error,
        refreshData,
        addControls,
        updateControl,
        deleteControl,
        clearAllData,
        lastRefreshTime,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
