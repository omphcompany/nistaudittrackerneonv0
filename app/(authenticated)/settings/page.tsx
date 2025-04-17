"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useData } from "@/contexts/data-context"
import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Settings() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { error } = useData()

  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [syncInterval, setSyncInterval] = useState(30)
  const [isOnline, setIsOnline] = useState(true)
  const [databaseUrl, setDatabaseUrl] = useState("")

  // Monitor online status
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Fetch database connection info (masked)
  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        const response = await fetch("/api/db-info")
        if (response.ok) {
          const data = await response.json()
          setDatabaseUrl(data.maskedUrl || "Connected to Neon Serverless PostgreSQL")
        }
      } catch (error) {
        console.error("Error fetching database info:", error)
      }
    }

    fetchDatabaseInfo()
  }, [])

  const handleResetSettings = () => {
    setNotificationsEnabled(false)
    setAutoSaveEnabled(true)
    setSyncInterval(30)
    setTheme("system")

    toast({
      title: "Settings Reset",
      description: "Your settings have been reset to defaults.",
    })
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast({
      title: "Theme Changed",
      description: `Theme set to ${newTheme} mode.`,
    })
  }

  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked)
    toast({
      title: "Notifications Setting Changed",
      description: `Notifications ${checked ? "enabled" : "disabled"}.`,
    })
  }

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSaveEnabled(checked)
    toast({
      title: "Auto Save Setting Changed",
      description: `Auto save ${checked ? "enabled" : "disabled"}.`,
    })
  }

  const handleSyncIntervalChange = (seconds: number) => {
    setSyncInterval(seconds)
    toast({
      title: "Sync Interval Changed",
      description: `Data sync interval set to ${seconds} seconds.`,
    })
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">Configure your NIST Audit Tracker preferences</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about control updates and compliance changes.
                  </p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationsChange} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes when editing controls.</p>
                </div>
                <Switch id="auto-save" checked={autoSaveEnabled} onCheckedChange={handleAutoSaveChange} />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleResetSettings} className="ml-auto">
                Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the content area.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Content Area Theme</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  This setting only affects the content area on the right side. The navigation will remain dark.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className="justify-start"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className="justify-start"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => handleThemeChange("system")}
                    className="justify-start"
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleResetSettings} className="ml-auto">
                Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Cloud Database Connection</CardTitle>
                <CardDescription>Information about your database connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>Neon Serverless PostgreSQL</AlertTitle>
                  <AlertDescription>
                    Your data is stored securely in Neon Serverless PostgreSQL. This means:
                    <ul className="list-disc pl-5 mt-2">
                      <li>Data is accessible from any device with an internet connection</li>
                      <li>Changes are synchronized in real-time across all devices</li>
                      <li>Your data is securely backed up in the cloud</li>
                      <li>Multiple users can access and update the same data simultaneously</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="mt-4">
                  <Label htmlFor="database-url">Database Connection</Label>
                  <div className="flex items-center mt-1 p-2 bg-muted rounded-md">
                    <span className="text-sm font-mono text-muted-foreground">{databaseUrl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    The database connection is configured via environment variables. Available variables include:
                  </p>
                  <ul className="text-xs text-muted-foreground mt-2 list-disc pl-5 space-y-1">
                    <li>DATABASE_URL / POSTGRES_URL: Primary connection strings</li>
                    <li>PGHOST / POSTGRES_HOST: Database host</li>
                    <li>PGUSER / POSTGRES_USER: Database user</li>
                    <li>PGPASSWORD / POSTGRES_PASSWORD: Database password</li>
                    <li>PGDATABASE / POSTGRES_DATABASE: Database name</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Synchronization Settings</CardTitle>
                <CardDescription>Configure data synchronization settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync Interval (seconds)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 60, 120].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={syncInterval === seconds ? "default" : "outline"}
                        onClick={() => handleSyncIntervalChange(seconds)}
                        className="justify-start"
                      >
                        {seconds} seconds
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    How often the application checks for updates from the server.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Connection Status</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span>{isOnline ? "Online" : "Offline"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isOnline
                      ? "Connected to the database. Changes will be synchronized in real-time."
                      : "Currently offline. Changes will be synchronized when you reconnect."}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleResetSettings} className="ml-auto">
                  Reset to Defaults
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
