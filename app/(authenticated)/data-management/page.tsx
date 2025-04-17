"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { parseExcelFile, exportToExcel } from "@/lib/excel-parser"
import { loadSampleData } from "@/lib/sample-data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileSpreadsheet, Upload, Download, Trash2, Database, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"

export default function DataManagement() {
  const { controls, loading, error, addControls, clearAllData, refreshData } = useData()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [controlCount, setControlCount] = useState<number>(0)

  const isDarkTheme = theme === "dark"

  // Update control count when controls change
  useEffect(() => {
    setControlCount(controls.length)
  }, [controls])

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "Data Refreshed",
        description: `Current control count: ${controls.length}`,
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        console.log("No file selected")
        return
      }

      console.log("File selected:", file.name, file.type, file.size)

      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setUploadError("Please select a valid Excel file (.xlsx or .xls)")
        return
      }

      setIsUploading(true)
      setUploadError(null)
      setUploadSuccess(null)

      try {
        console.log("Starting to parse Excel file...")
        const parsedData = await parseExcelFile(file)
        console.log("Excel file parsed successfully, found", parsedData.length, "records")

        if (parsedData.length === 0) {
          setUploadError("No valid data found in the Excel file.")
          return
        }

        // Add a timestamp to make each upload unique
        const timestamp = new Date()
        const enhancedData = parsedData.map((item, index) => ({
          ...item,
          controlDescription: `${item.controlDescription} - Uploaded at ${timestamp.toISOString()}`,
          lastUpdated: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        }))

        console.log("Adding controls to database...")
        const result = await addControls(enhancedData)
        console.log("Database operation result:", result)

        if (result) {
          setUploadSuccess(
            `${parsedData.length} controls were imported successfully. You can now view the data in the Dashboard, Controls Explorer, and Reports sections.`,
          )
          toast({
            title: "Upload Successful",
            description: `${parsedData.length} controls were imported successfully.`,
          })

          // Force a refresh of the data
          await refreshData()
          setControlCount(controls.length + parsedData.length)
        } else {
          setUploadError("Failed to add controls to the database.")
        }
      } catch (err) {
        console.error("Error uploading file:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"

        // Check if it's an authentication error
        if (errorMessage.includes("Authentication required")) {
          setUploadError("Authentication required. Please log in to continue.")
          // Redirect to login page
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else {
          setUploadError(`Error parsing Excel file: ${errorMessage}. Please check the file format.`)
        }
      } finally {
        setIsUploading(false)
        // Reset the file input
        if (event.target) {
          event.target.value = ""
        }
      }
    },
    [addControls, toast, refreshData, controls.length],
  )

  const handleLoadSampleData = useCallback(async () => {
    setIsLoading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      // Load the sample data
      const sampleData = loadSampleData()
      console.log("Loaded sample data:", sampleData.length, "controls")

      // Add to database
      const result = await addControls(sampleData)

      if (result) {
        setUploadSuccess(
          `${sampleData.length} sample controls were loaded successfully. You can now view the data in the Dashboard, Controls Explorer, and Reports sections.`,
        )
        toast({
          title: "Sample Data Loaded",
          description: `${sampleData.length} sample controls were loaded successfully.`,
        })

        // Force a refresh of the data
        await refreshData()
        setControlCount((prevCount) => prevCount + sampleData.length)
      } else {
        setUploadError("Failed to add sample controls to the database.")
      }
    } catch (err) {
      console.error("Error loading sample data:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"

      // Check if it's an authentication error
      if (errorMessage.includes("Authentication required")) {
        setUploadError("Authentication required. Please log in to continue.")
        // Redirect to login page
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        setUploadError(`Error loading sample data: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [addControls, toast, refreshData])

  const handleExport = useCallback(() => {
    if (controls.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data to export.",
        variant: "destructive",
      })
      return
    }

    try {
      exportToExcel(controls)
      toast({
        title: "Export Successful",
        description: "Data exported to Excel file.",
      })
    } catch (err) {
      console.error("Error exporting data:", err)
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel file.",
        variant: "destructive",
      })
    }
  }, [controls, toast])

  const handleClearData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await clearAllData()

      if (result) {
        toast({
          title: "Data Cleared",
          description: "All controls data has been removed.",
        })
        setUploadSuccess(null)
        setControlCount(0)
        // Add a console log to verify the operation completed
        console.log("Data cleared successfully")
      } else {
        toast({
          title: "Operation Failed",
          description: "Failed to clear data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      toast({
        title: "Operation Failed",
        description: "An error occurred while clearing data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsConfirmDialogOpen(false)
    }
  }, [clearAllData, toast])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">Import, export, and manage your NIST controls data</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Current controls: <span className="font-bold">{controlCount}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="import" className="w-full">
        <TabsList className={`grid w-full grid-cols-3 ${isDarkTheme ? "" : "bg-black"}`}>
          <TabsTrigger
            value="import"
            className={`
              data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
              ${isDarkTheme ? "text-white hover:bg-gray-700" : "text-white hover:bg-[#07315A]"}
            `}
          >
            Import Data
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className={`
              data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
              ${isDarkTheme ? "text-white hover:bg-gray-700" : "text-white hover:bg-[#07315A]"}
            `}
          >
            Export Data
          </TabsTrigger>
          <TabsTrigger
            value="clear"
            className={`
              data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
              ${isDarkTheme ? "text-white hover:bg-gray-700" : "text-white hover:bg-[#07315A]"}
            `}
          >
            Clear Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Controls from Excel</CardTitle>
              <CardDescription>Upload an Excel file containing NIST CSF 2.0 controls data.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Sample Data Loading */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-blue-50 dark:bg-blue-900/10 mb-6">
                <Database className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4 text-center">
                  Load sample NIST control data for testing and demonstration
                </p>
                <Button
                  onClick={handleLoadSampleData}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isLoading ? "Loading..." : "Load Sample Data"}
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Regular File Upload */}
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <FileSpreadsheet className="h-12 w-12 text-primary mb-4" />
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Click the button below to select an Excel file
                </p>
                <div className="relative">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    onClick={(e) => {
                      // Reset the value when clicked to ensure onChange fires even if the same file is selected
                      ;(e.target as HTMLInputElement).value = ""
                    }}
                  />
                  <Button disabled={isUploading} size="lg" className="gap-2 pointer-events-none">
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload Excel File"}
                  </Button>
                </div>
              </div>

              {uploadError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {uploadSuccess && (
                <Alert
                  variant="default"
                  className="mt-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{uploadSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Expected Format</h3>
                <p className="text-sm text-muted-foreground mb-2">Your Excel file should have the following columns:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Owner</li>
                  <li>NIST Function</li>
                  <li>NIST Category & ID</li>
                  <li>NIST Sub-Category & ID</li>
                  <li>Assessment Priority</li>
                  <li>Control Description</li>
                  <li>Cybersecurity Domain</li>
                  <li>Meets Criteria (Yes/No)</li>
                  <li>Identified Risks</li>
                  <li>Risk Details</li>
                  <li>Remediation Status</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {controlCount > 0 ? `${controlCount} controls in database` : "No controls in database"}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Controls to Excel</CardTitle>
              <CardDescription>Export all controls data to an Excel file.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Click the button below to export all controls data</p>
                <Button onClick={handleExport} disabled={controls.length === 0 || loading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </div>

              {controls.length === 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data</AlertTitle>
                  <AlertDescription>There are no controls to export. Please import data first.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clear" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clear All Data</CardTitle>
              <CardDescription>Remove all controls data from the database.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                <Trash2 className="h-10 w-10 text-destructive mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  This action will permanently delete all controls data
                </p>
                <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={controls.length === 0 || loading}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete all controls data from the database.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearData}>
                        Delete All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {controls.length === 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data</AlertTitle>
                  <AlertDescription>There are no controls to clear.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
