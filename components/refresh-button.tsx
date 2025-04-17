"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useState } from "react"

export function RefreshButton() {
  const { refreshData } = useData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
      }, 1000) // Minimum 1 second of loading state for better UX
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-1">
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </Button>
  )
}
