"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useData } from "@/contexts/data-context"
import { loadSampleDataAction } from "./actions"
import { AlertCircle, FileSpreadsheet, Database, RefreshCw, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DataManagementPage() {
  const { toast } = useToast()
  const { controls, loading, error, addControls, clearAllData, refreshData } = useData()
  const [activeTab, setActiveTab] = useState("import")
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadSampleData = async () => {
    try {
      setIsLoading(true)
      console.log("Loading sample data...")

      // Call the server action to generate sample data
      const result = await loadSampleDataAction()

      if (result.success && result.data) {
        console.log(`Received ${result.data.length} sample controls from server action`)

        // Add the sample data to the database
        const addResult = await addControls(result.data)

        if (addResult) {
          toast({
            title: "Sample Data Loaded",
            description: `Successfully loaded ${result.data.length} sample controls`,
          })
        } else {
          toast({
            title: "Failed to Load Sample Data",
            description: "The sample data was generated but could not be added to the database",
            variant: "destructive",
          })
        }
      } else {
        console.error("Error loading sample data:", result.error)
        toast({
          title: "Error Loading Sample Data",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in handleLoadSampleData:", error)
      toast({
        title: "Error Loading Sample Data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearData = async () => {
    try {
      setIsLoading(true)
      const result = await clearAllData()

      if (result) {
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
    } catch (error) {
      console.error("Error clearing data:", error)
      toast({
        title: "Error Clearing Data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshData = async () => {
    try {
      setIsLoading(true)
      await refreshData()

      toast({
        title: "Data Refreshed",
        description: "Controls data has been refreshed",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error Refreshing Data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleClearData} disabled={isLoading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Controls</CardTitle>
          <CardDescription>Import, export, and manage your NIST CSF 2.0 controls data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="export">Export Data</TabsTrigger>
            </TabsList>
            <TabsContent value="import" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Data</CardTitle>
                    <CardDescription>Load sample NIST CSF 2.0 controls for testing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will generate 50 sample NIST controls with random values for testing purposes.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleLoadSampleData}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "Loading..." : "Load Sample Data"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Excel Import</CardTitle>
                    <CardDescription>Import NIST controls from Excel spreadsheet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload an Excel file containing your NIST controls data.
                    </p>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="excel-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileSpreadsheet className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Excel files only (XLSX)</p>
                        </div>
                        <input id="excel-upload" type="file" className="hidden" accept=".xlsx" />
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="w-full">
                      Upload Excel File
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="export" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Controls</CardTitle>
                  <CardDescription>Export your NIST controls data to various formats</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your current NIST controls data to Excel, CSV, or JSON format.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" disabled={loading || controls.length === 0}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export to Excel
                    </Button>
                    <Button variant="outline" disabled={loading || controls.length === 0}>
                      <Database className="mr-2 h-4 w-4" />
                      Export to CSV
                    </Button>
                    <Button variant="outline" disabled={loading || controls.length === 0}>
                      <Database className="mr-2 h-4 w-4" />
                      Export to JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading controls..." : `${controls.length} controls loaded`}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
