"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getControls, addControls, updateControl, clearAllData } from "@/lib/db"
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getControls()
        setControls(data)
      } catch (e: any) {
        setError(e.message || "Failed to fetch controls")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addControlsToDb = async (newControls: NistControl[]): Promise<boolean> => {
    try {
      await addControls(newControls)
      await refreshData() // Refresh data after adding
      return true
    } catch (e: any) {
      setError(e.message || "Failed to add controls")
      return false
    }
  }

  const updateControlInDb = async (control: NistControl): Promise<boolean> => {
    try {
      await updateControl(control)
      await refreshData() // Refresh data after updating
      return true
    } catch (e: any) {
      setError(e.message || "Failed to update control")
      return false
    }
  }

  const clearAllDataFromDb = async (): Promise<boolean> => {
    try {
      await clearAllData()
      setControls([]) // Clear local state immediately for better UX
      return true
    } catch (e: any) {
      setError(e.message || "Failed to clear data")
      return false
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getControls()
      setControls(data)
    } catch (e: any) {
      setError(e.message || "Failed to fetch controls")
    } finally {
      setLoading(false)
    }
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
