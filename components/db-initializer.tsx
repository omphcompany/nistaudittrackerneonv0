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
        console.log("Initializing database...")
        const response = await fetch("/api/init-db")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(`Failed to initialize database: ${data.error || response.statusText}`)
        }

        console.log("Database initialization result:", data)
        setInitialized(true)

        // Only show toast on success in development
        if (process.env.NODE_ENV === "development") {
          toast({
            title: "Database Connected",
            description: "Successfully connected to the database",
          })
        }
      } catch (err) {
        console.error("Error initializing database:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)

        toast({
          title: "Database Connection Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }

    initDb()
  }, [toast])

  // This component doesn't render anything visible
  return null
}
