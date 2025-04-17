"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getControls, addControls, updateControl, clearAllData } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import type { NistControl } from "@/lib/types"

interface DataContextType {
  controls: NistControl[]
  loading: boolean
  error: string | null
  addControls: (controls: NistControl[]) => Promise<boolean>
  updateControl: (control: NistControl) => Promise<boolean>
  clearAllData: () => Promise<boolean>
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<NistControl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching controls data...")
      const data = await getControls()
      console.log(`Fetched ${data.length} controls`)
      setControls(data)
    } catch (e: any) {
      const errorMessage = e.message || "Failed to fetch controls"
      console.error("Error fetching controls:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Data Loading Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Delay the initial data fetch to ensure database is initialized
    const timer = setTimeout(() => {
      fetchData()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const addControlsToDb = async (newControls: NistControl[]): Promise<boolean> => {
    try {
      console.log(`Adding ${newControls.length} controls...`)
      const result = await addControls(newControls)

      if (result) {
        toast({
          title: "Controls Added",
          description: `Successfully added ${newControls.length} controls`,
        })

        await refreshData() // Refresh data after adding
      } else {
        toast({
          title: "Failed to Add Controls",
          description: "An error occurred while adding controls",
          variant: "destructive",
        })
      }

      return result
    } catch (e: any) {
      const errorMessage = e.message || "Failed to add controls"
      console.error("Error adding controls:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error Adding Controls",
        description: errorMessage,
        variant: "destructive",
      })

      return false
    }
  }

  const updateControlInDb = async (control: NistControl): Promise<boolean> => {
    try {
      console.log(`Updating control ${control.id}...`)
      const result = await updateControl(control)

      if (result) {
        toast({
          title: "Control Updated",
          description: `Successfully updated control ${control.control_id || control.id}`,
        })

        await refreshData() // Refresh data after updating
      } else {
        toast({
          title: "Failed to Update Control",
          description: "An error occurred while updating the control",
          variant: "destructive",
        })
      }

      return result
    } catch (e: any) {
      const errorMessage = e.message || "Failed to update control"
      console.error("Error updating control:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error Updating Control",
        description: errorMessage,
        variant: "destructive",
      })

      return false
    }
  }

  const clearAllDataFromDb = async (): Promise<boolean> => {
    try {
      console.log("Clearing all data...")
      const result = await clearAllData()

      if (result) {
        setControls([]) // Clear local state immediately for better UX

        toast({
          title: "Data Cleared",
          description: "All controls data has been cleared",
        })
      } else {
        toast({
          title: "Failed to Clear Data",
          description: "An error occurred while clearing data",
          variant: "destructive",
        })
      }

      return result
    } catch (e: any) {
      const errorMessage = e.message || "Failed to clear data"
      console.error("Error clearing data:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error Clearing Data",
        description: errorMessage,
        variant: "destructive",
      })

      return false
    }
  }

  const refreshData = async () => {
    console.log("Refreshing controls data...")
    await fetchData()
  }

  const value: DataContextType = {
    controls,
    loading,
    error,
    addControls: addControlsToDb,
    updateControl: updateControlInDb,
    clearAllData: clearAllDataFromDb,
    refreshData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextType {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
