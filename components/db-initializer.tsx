"use client"

import { useEffect, useState } from "react"
import { initDb, checkDbExists } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

export function DbInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Checking if database exists...")
        const exists = await checkDbExists()

        if (!exists) {
          console.log("Database doesn't exist, initializing...")
          const result = await initDb()
          console.log("Database initialization result:", result)

          if (result) {
            setInitialized(true)
            toast({
              title: "Database Initialized",
              description: "Local database has been successfully initialized",
            })
          } else {
            setError("Failed to initialize database")
            toast({
              title: "Database Error",
              description: "Failed to initialize local database",
              variant: "destructive",
            })
          }
        } else {
          console.log("Database already exists")
          setInitialized(true)
        }
      } catch (err) {
        console.error("Error initializing database:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error initializing database"
        setError(errorMessage)

        toast({
          title: "Database Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }

    initialize()
  }, [toast])

  // This component doesn't render anything visible
  return null
}
