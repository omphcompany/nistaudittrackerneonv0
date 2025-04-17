"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"

export function DbStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/db-status", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch database status: ${response.statusText}`)
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("Error fetching database status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
        <CardDescription>Current status of the database connection</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : status ? (
          <div className="space-y-4">
            <div>
              <p className="font-medium">Connection Status:</p>
              <p className={status.connected ? "text-green-500" : "text-red-500"}>
                {status.connected ? "Connected" : "Disconnected"}
              </p>
            </div>

            {status.tables && (
              <div>
                <p className="font-medium">Table Counts:</p>
                <ul className="list-disc list-inside">
                  <li>Controls: {status.tables.NistControl}</li>
                  <li>Excel Files: {status.tables.ExcelFile}</li>
                </ul>
              </div>
            )}

            {status.recentControls && status.recentControls.length > 0 && (
              <div>
                <p className="font-medium">Recent Controls:</p>
                <ul className="list-disc list-inside">
                  {status.recentControls.map((control: any) => (
                    <li key={control.id}>
                      ID: {control.id}, Function: {control.nistFunction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(status.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p>No status information available</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchStatus} disabled={loading} variant="outline" className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
