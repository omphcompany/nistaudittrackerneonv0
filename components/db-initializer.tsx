"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function DbInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initDb = async () => {
      try {
        // Only attempt to initialize the database in production
        // In development/preview, we'll use mock data
        if (process.env.NODE_ENV === "production") {
          console.log("Initializing database in production environment...")
          const response = await fetch("/api/init-db")
          const data = await response.json()

          if (!response.ok) {
            throw new Error(`Failed to initialize database: ${data.error || response.statusText}`)
          }

          console.log("Database initialization result:", data)
          setInitialized(true)

          toast({
            title: "Database Connected",
            description: "Successfully connected to the database",
          })
        } else {
          // In development/preview, just log and set as initialized
          console.log("Running in development/preview mode - using mock data")
          setInitialized(true)

          // Only show toast in development
          if (process.env.NODE_ENV === "development") {
            toast({
              title: "Development Mode",
              description: "Using mock data (no database connection)",
            })
          }
        }
      } catch (err) {
        console.error("Error initializing database:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown database error"
        setError(errorMessage)

        // Show error toast but don't block the application
        toast({
          title: "Using Local Data",
          description: "Database connection unavailable - using browser storage",
          variant: "default", // Changed from destructive to default
        })

        // Still set as initialized so the app can continue with local data
        setInitialized(true)
      }
    }

    initDb()
  }, [toast])

  // This component doesn't render anything visible
  return null
}
