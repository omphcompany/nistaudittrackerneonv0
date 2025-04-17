"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Control } from "@/lib/types"

// Define polling interval (120 seconds = 120000 ms)
const POLLING_INTERVAL = 120000

// List of public pages that don't require authentication
const PUBLIC_PAGES = ["/login", "/introduction"]

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
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuth()

  const refreshData = useCallback(async () => {
    // Skip refresh if it's been less than 1 minute since the last refresh
    if (lastRefreshTime && new Date().getTime() - lastRefreshTime.getTime() < 60000) {
      console.log("Skipping refresh - too soon since last refresh")
      return
    }

    // Skip refresh if we're on a public page
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname
      if (PUBLIC_PAGES.some((page) => currentPath === page || currentPath === `${page}/`)) {
        console.log(`Skipping data refresh on public page: ${currentPath}`)
        setLoading(false) // Set loading to false to avoid showing loading state on public pages
        return
      }
    }

    // Check authentication status
    const isAuth = checkAuth()
    console.log("Data context - Auth check before refresh:", isAuth, "Cookie:", document.cookie)

    // Skip refresh if not authenticated
    if (!isAuth) {
      console.log("Skipping refresh - not authenticated")
      setLoading(false)
      setError("Authentication required. Please log in.")
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching controls data...")
      const startTime = performance.now()

      const response = await fetch("/api/controls", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          // Add auth header as a backup
          "X-Auth-Status": "true",
        },
        credentials: "include", // Include cookies in the request
      })

      if (!response.ok) {
        // Check if the response is a 401 Unauthorized
        if (response.status === 401) {
          console.error("Authentication required, redirecting to login")
          router.push("/login")
          throw new Error("Authentication required. Please log in.")
        }

        // Check if the response is HTML (likely a login page)
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("text/html")) {
          console.error("Received HTML instead of JSON. Redirecting to login.")
          router.push("/login")
          throw new Error("Received HTML instead of JSON. You may need to log in.")
        }

        const errorData = await response.json().catch(() => ({ error: "Invalid response format" }))
        console.error("Error fetching controls:", errorData)
        throw new Error(errorData.error || "Failed to fetch controls")
      }

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType}`)
      }

      const data = await response.json()
      const endTime = performance.now()

      console.log(`Fetched ${data.length} controls in ${(endTime - startTime).toFixed(2)}ms`)
      setControls(data)
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error("Error in refreshData:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")

      // If we get an authentication error, clear the controls and redirect to login
      if (
        err instanceof Error &&
        (err.message.includes("log in") ||
          err.message.includes("authentication") ||
          err.message.includes("Authentication"))
      ) {
        setControls([])
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }, [lastRefreshTime, router, checkAuth])

  const addControls = useCallback(
    async (newControls: Control[]): Promise<boolean> => {
      try {
        console.log(`Adding ${newControls.length} controls...`)
        const startTime = performance.now()

        // Check authentication before making the request
        if (!checkAuth()) {
          console.error("Not authenticated, redirecting to login")
          router.push("/login")
          throw new Error("Authentication required. Please log in.")
        }

        const response = await fetch("/api/controls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Ensure cookies are sent with the request
          body: JSON.stringify(newControls),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error adding controls:", errorData)

          // Check for authentication errors
          if (response.status === 401) {
            // Redirect to login page if not authenticated
            console.error("Authentication required, redirecting to login")
            router.push("/login")
            throw new Error("Authentication required. Please log in.")
          }

          throw new Error(errorData.error || "Failed to add controls")
        }

        const endTime = performance.now()
        console.log(`Added controls in ${(endTime - startTime).toFixed(2)}ms`)

        await refreshData()
        return true
      } catch (err) {
        console.error("Error in addControls:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // If authentication error, redirect to login
        if (
          err instanceof Error &&
          (err.message.includes("Authentication") || err.message.includes("authentication"))
        ) {
          router.push("/login")
        }

        return false
      }
    },
    [refreshData, router, checkAuth],
  )

  const updateControl = useCallback(
    async (control: Control): Promise<boolean> => {
      try {
        console.log(`Updating control ${control.id}...`)
        const startTime = performance.now()

        // Check authentication before making the request
        if (!checkAuth()) {
          console.error("Not authenticated, redirecting to login")
          router.push("/login")
          throw new Error("Authentication required. Please log in.")
        }

        const response = await fetch(`/api/controls/${control.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify(control),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error updating control:", errorData)

          // Check for authentication errors
          if (response.status === 401) {
            console.error("Authentication required, redirecting to login")
            router.push("/login")
            throw new Error("Authentication required. Please log in.")
          }

          throw new Error(errorData.error || "Failed to update control")
        }

        const endTime = performance.now()
        console.log(`Updated control in ${(endTime - startTime).toFixed(2)}ms`)

        await refreshData()
        return true
      } catch (err) {
        console.error("Error in updateControl:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // If authentication error, redirect to login
        if (
          err instanceof Error &&
          (err.message.includes("Authentication") || err.message.includes("authentication"))
        ) {
          router.push("/login")
        }

        return false
      }
    },
    [refreshData, router, checkAuth],
  )

  const deleteControl = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        console.log(`Deleting control ${id}...`)
        const startTime = performance.now()

        // Check authentication before making the request
        if (!checkAuth()) {
          console.error("Not authenticated, redirecting to login")
          router.push("/login")
          throw new Error("Authentication required. Please log in.")
        }

        const response = await fetch(`/api/controls/${id}`, {
          method: "DELETE",
          credentials: "include", // Include cookies in the request
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error deleting control:", errorData)

          // Check for authentication errors
          if (response.status === 401) {
            console.error("Authentication required, redirecting to login")
            router.push("/login")
            throw new Error("Authentication required. Please log in.")
          }

          throw new Error(errorData.error || "Failed to delete control")
        }

        const endTime = performance.now()
        console.log(`Deleted control in ${(endTime - startTime).toFixed(2)}ms`)

        await refreshData()
        return true
      } catch (err) {
        console.error("Error in deleteControl:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // If authentication error, redirect to login
        if (
          err instanceof Error &&
          (err.message.includes("Authentication") || err.message.includes("authentication"))
        ) {
          router.push("/login")
        }

        return false
      }
    },
    [refreshData, router, checkAuth],
  )

  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Clearing all controls data...")
      const startTime = performance.now()

      // Check authentication before making the request
      if (!checkAuth()) {
        console.error("Not authenticated, redirecting to login")
        router.push("/login")
        throw new Error("Authentication required. Please log in.")
      }

      // Get current count before deletion
      const currentCount = controls.length
      console.log(`Current control count before deletion: ${currentCount}`)

      const response = await fetch("/api/controls", {
        method: "DELETE",
        credentials: "include", // Include cookies in the request
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error clearing data:", errorData)

        // Check for authentication errors
        if (response.status === 401) {
          console.error("Authentication required, redirecting to login")
          router.push("/login")
          throw new Error("Authentication required. Please log in.")
        }

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

      // If authentication error, redirect to login
      if (err instanceof Error && (err.message.includes("Authentication") || err.message.includes("authentication"))) {
        router.push("/login")
      }

      return false
    }
  }, [controls.length, refreshData, router, checkAuth])

  useEffect(() => {
    // Skip initial data fetching if we're on a public page
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname
      if (PUBLIC_PAGES.some((page) => currentPath === page || currentPath === `${page}/`)) {
        console.log(`Skipping initial data fetch on public page: ${currentPath}`)
        setLoading(false) // Set loading to false to avoid showing loading state on public pages
        return
      }
    }

    // Skip initial data fetching if not authenticated
    if (!isAuthenticated) {
      console.log("Skipping initial data fetch - not authenticated")
      setLoading(false)
      return
    }

    refreshData()

    // Set up polling for real-time updates (every 120 seconds)
    const intervalId = setInterval(() => {
      // Only poll if authenticated
      if (checkAuth()) {
        console.log("Polling for data updates...")
        refreshData()
      } else {
        console.log("Skipping polling - not authenticated")
      }
    }, POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [refreshData, isAuthenticated, checkAuth])

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
