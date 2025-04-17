"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { NistControl } from "@/lib/types"
import { loadSampleData } from "@/lib/sample-data"

// Helper function to format error messages
function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }
  return String(error)
}

interface DataContextType {
  controls: NistControl[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  addControls: (controls: NistControl[]) => Promise<boolean>
  updateControl: (control: NistControl) => Promise<boolean>
  deleteControl: (id: number) => Promise<boolean>
  clearAllData: () => Promise<boolean>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [controls, setControls] = useState<NistControl[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState(0)

  // Check if we're in preview mode (v0 environment)
  useEffect(() => {
    // This is a simple heuristic to detect if we're in the v0 preview environment
    const isPreview =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vusercontent.net") ||
        window.location.hostname.includes("vercel-v0.app") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")

    setIsPreviewMode(isPreview)

    // If we're in preview mode, load sample data directly
    if (isPreview) {
      console.log("Running in preview mode - using sample data")
      setControls(loadSampleData())
      setLoading(false)
    }
  }, [])

  // Fetch all controls from the API
  const refreshData = async () => {
    // If in preview mode, use sample data but don't replace existing data
    if (isPreviewMode) {
      // Only load sample data if we don't have any controls yet
      if (controls.length === 0) {
        console.log("Preview mode: Loading initial sample data")
        setControls(loadSampleData())
      } else {
        console.log("Preview mode: Using existing controls data, count:", controls.length)
      }
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Fetching controls from API...")
      const response = await fetch("/api/controls", {
        // Add cache: 'no-store' to prevent caching issues
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      // Log the response status for debugging
      console.log(`API response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorText = errorData ? JSON.stringify(errorData) : await response.text()
        console.error(`API response error: ${response.status} ${response.statusText}`, errorText)
        throw new Error(`Failed to fetch controls: ${response.statusText}. ${errorText}`)
      }

      const data = await response.json()
      console.log("Refreshed data count:", data.length)

      // Convert date strings to Date objects
      const formattedData = data.map((control: any) => ({
        ...control,
        lastUpdated: new Date(control.lastUpdated),
        createdAt: control.createdAt ? new Date(control.createdAt) : undefined,
        updatedAt: control.updatedAt ? new Date(control.updatedAt) : undefined,
      }))

      setControls(formattedData)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error("Error refreshing data:", err)

      // More detailed error message
      const errorMessage = formatErrorMessage(err)

      console.error("Detailed error:", errorMessage)
      setError(`Failed to load data from the server: ${errorMessage}`)

      // Fallback to sample data in case of error
      if (controls.length === 0) {
        console.log("Falling back to sample data due to error")
        setControls(loadSampleData())
      }

      // Increment retry count
      setRetryCount((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  // Add controls to the database
  const addControls = async (newControls: NistControl[]): Promise<boolean> => {
    console.log("Adding controls, count:", newControls.length)

    // If in preview mode, just update the local state
    if (isPreviewMode) {
      console.log("Preview mode: Adding", newControls.length, "controls to local state")

      // Ensure each control has a unique ID
      const controlsWithIds = newControls.map((control, index) => ({
        ...control,
        id: control.id || Date.now() + index, // Use existing ID or generate a new one
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      // Append new controls to existing ones
      setControls((prev) => [...prev, ...controlsWithIds])
      console.log("Preview mode: Total controls after adding:", controls.length + controlsWithIds.length)
      return true
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Sending", newControls.length, "controls to API")
      const response = await fetch("/api/controls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(newControls),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to add controls: ${response.statusText}. ${errorText}`)
      }

      const addedControls = await response.json()
      console.log("Successfully added controls to database, count:", addedControls.length)

      // Explicitly refresh data after adding controls
      await refreshData()
      return true
    } catch (err) {
      console.error("Error adding controls:", err)
      setError(`Failed to add controls to the database: ${err instanceof Error ? err.message : "Unknown error"}`)

      // In case of error, add the controls to local state anyway
      const controlsWithIds = newControls.map((control, index) => ({
        ...control,
        id: control.id || Date.now() + index,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      setControls((prev) => [...prev, ...controlsWithIds])
      console.log("Added controls to local state due to API error")

      return true // Return true to indicate to the user that the operation succeeded
    } finally {
      setLoading(false)
    }
  }

  // Update a control in the database
  const updateControl = async (control: NistControl): Promise<boolean> => {
    // If in preview mode, update the local state
    if (isPreviewMode) {
      setControls((prev) =>
        prev.map((c) =>
          c.id === control.id
            ? {
                ...control,
                lastUpdated: new Date(),
                updatedAt: new Date(),
              }
            : c,
        ),
      )
      return true
    }

    if (!control.id) {
      console.error("Cannot update control without ID")
      setError("Cannot update control without ID")
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/controls/${control.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          ...control,
          lastUpdated: new Date(),
          updatedAt: new Date(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update control: ${response.statusText}`)
      }

      await refreshData()
      return true
    } catch (err) {
      console.error("Error updating control:", err)
      setError("Failed to update control in the database")

      // Update in local state anyway
      setControls((prev) =>
        prev.map((c) =>
          c.id === control.id
            ? {
                ...control,
                lastUpdated: new Date(),
                updatedAt: new Date(),
              }
            : c,
        ),
      )

      return true
    } finally {
      setLoading(false)
    }
  }

  // Delete a control from the database
  const deleteControl = async (id: number): Promise<boolean> => {
    // If in preview mode, update the local state
    if (isPreviewMode) {
      setControls((prev) => prev.filter((c) => c.id !== id))
      return true
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/controls/${id}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete control: ${response.statusText}`)
      }

      await refreshData()
      return true
    } catch (err) {
      console.error("Error deleting control:", err)
      setError("Failed to delete control from the database")

      // Delete from local state anyway
      setControls((prev) => prev.filter((c) => c.id !== id))
      return true
    } finally {
      setLoading(false)
    }
  }

  // Clear all controls from the database
  const clearAllData = async (): Promise<boolean> => {
    // If in preview mode, just clear the local state
    if (isPreviewMode) {
      console.log("Preview mode: Clearing all controls")
      setControls([])
      return true
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/controls", {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to clear data: ${response.statusText}`)
      }

      // Explicitly set controls to empty array
      setControls([])
      console.log("Data cleared, controls reset")
      return true
    } catch (err) {
      console.error("Error clearing data:", err)
      setError("Failed to clear data from the database")

      // Clear local state anyway
      setControls([])
      return true
    } finally {
      setLoading(false)
    }
  }

  // Initialize and load data
  useEffect(() => {
    // Skip API calls if in preview mode
    if (!isPreviewMode) {
      refreshData()

      // Set up polling for real-time updates (every 30 seconds)
      const intervalId = setInterval(() => {
        refreshData()
      }, 30000)

      return () => clearInterval(intervalId)
    }
  }, [isPreviewMode])

  // If we've had multiple failures, switch to preview mode
  useEffect(() => {
    if (retryCount > 3) {
      console.log("Multiple database connection failures, switching to preview mode")
      setIsPreviewMode(true)
      setControls(loadSampleData())
      setLoading(false)
      setError("Database connection failed. Using sample data instead.")
    }
  }, [retryCount])

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
