"use client"

import { useEffect, useState, useMemo } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import { ChartContainer } from "@/components/ui/chart"
import { RefreshButton } from "@/components/refresh-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  CartesianGrid,
} from "recharts"

export default function OwnerDashboard() {
  const { controls, loading, error } = useData()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [selectedOwner, setSelectedOwner] = useState<string>("")

  // Extract unique owners
  const owners = useMemo(() => {
    if (!controls || controls.length === 0) return []
    const ownerSet = new Set(controls.map((control) => control.owner))
    return Array.from(ownerSet).sort()
  }, [controls])

  // Set default selected owner when owners are loaded
  useEffect(() => {
    if (owners.length > 0 && !selectedOwner) {
      setSelectedOwner(owners[0])
    }
  }, [owners, selectedOwner])

  // Filter controls by selected owner
  const ownerControls = useMemo(() => {
    if (!selectedOwner) return []
    return controls.filter((control) => control.owner === selectedOwner)
  }, [controls, selectedOwner])

  // Calculate owner-specific metrics
  const ownerStats = useMemo(() => {
    if (!ownerControls || ownerControls.length === 0) {
      return {
        totalControls: 0,
        compliantControls: 0,
        nonCompliantControls: 0,
        complianceRate: 0,
        highPriorityIssues: 0,
        mediumPriorityIssues: 0,
        lowPriorityIssues: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        functionDistribution: [],
        statusDistribution: [],
        priorityDistribution: [],
      }
    }

    // Calculate basic metrics
    const compliantControls = ownerControls.filter((c) => c.meetsCriteria === "Yes").length
    const nonCompliantControls = ownerControls.length - compliantControls
    const complianceRate = (compliantControls / ownerControls.length) * 100

    const highPriorityIssues = ownerControls.filter(
      (c) => c.assessmentPriority === "High" && c.meetsCriteria === "No",
    ).length
    const mediumPriorityIssues = ownerControls.filter(
      (c) => c.assessmentPriority === "Medium" && c.meetsCriteria === "No",
    ).length
    const lowPriorityIssues = ownerControls.filter(
      (c) => c.assessmentPriority === "Low" && c.meetsCriteria === "No",
    ).length

    const notStarted = ownerControls.filter((c) => c.remediationStatus === "Not Started").length
    const inProgress = ownerControls.filter((c) => c.remediationStatus === "In Progress").length
    const completed = ownerControls.filter((c) => c.remediationStatus === "Completed").length

    // Calculate function distribution
    const functionCounts: Record<string, number> = {}
    ownerControls.forEach((control) => {
      const functionCode = control.nistFunction
      functionCounts[functionCode] = (functionCounts[functionCode] || 0) + 1
    })

    const functionDistribution = Object.entries(functionCounts).map(([name, value]) => ({
      name,
      value,
      fill: getFunctionColor(name),
    }))

    // Status distribution for pie chart
    const statusDistribution = [
      { name: "Completed", value: completed, fill: "#10b981" },
      { name: "In Progress", value: inProgress, fill: "#f59e0b" },
      { name: "Not Started", value: notStarted, fill: "#ef4444" },
    ]

    // Priority distribution for pie chart
    const priorityDistribution = [
      { name: "High", value: highPriorityIssues, fill: "#ef4444" },
      { name: "Medium", value: mediumPriorityIssues, fill: "#f59e0b" },
      { name: "Low", value: lowPriorityIssues, fill: "#10b981" },
    ]

    return {
      totalControls: ownerControls.length,
      compliantControls,
      nonCompliantControls,
      complianceRate,
      highPriorityIssues,
      mediumPriorityIssues,
      lowPriorityIssues,
      notStarted,
      inProgress,
      completed,
      functionDistribution,
      statusDistribution,
      priorityDistribution,
    }
  }, [ownerControls])

  // Helper function to get color for NIST function
  function getFunctionColor(func: string) {
    const colors: Record<string, string> = {
      "Govern (GV)": "#8b5cf6", // Purple
      "Identify (ID)": "#3b82f6", // Blue
      "Protect (PR)": "#10b981", // Green
      "Detect (DE)": "#f59e0b", // Amber
      "Respond (RS)": "#ef4444", // Red
      "Recover (RC)": "#6366f1", // Indigo
      // Short codes
      GV: "#8b5cf6",
      ID: "#3b82f6",
      PR: "#10b981",
      DE: "#f59e0b",
      RS: "#ef4444",
      RC: "#6366f1",
    }

    return colors[func] || "#64748b" // Default slate
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="col-span-1">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // No data state
  if (controls.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            No controls data found. Please upload data in the Data Management section.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground">Track and monitor controls by owner organization</p>
        </div>
        <RefreshButton />
      </div>

      {/* Owner Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Owner</CardTitle>
          <CardDescription>Choose an owner organization to view their controls</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedOwner} onValueChange={setSelectedOwner}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select an owner" />
            </SelectTrigger>
            <SelectContent>
              {owners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerStats.totalControls}</div>
            <p className="text-xs text-muted-foreground">
              {ownerStats.compliantControls} compliant, {ownerStats.nonCompliantControls} non-compliant
            </p>
            <Progress
              value={ownerStats.complianceRate}
              className="h-2 mt-2"
              indicatorClassName={ownerStats.complianceRate > 50 ? "bg-green-500" : "bg-amber-500"}
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerStats.highPriorityIssues}</div>
            <p className="text-xs text-muted-foreground">
              {ownerStats.mediumPriorityIssues} medium, {ownerStats.lowPriorityIssues} low priority issues
            </p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-red-500">Requires immediate attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remediation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {ownerStats.inProgress} in progress, {ownerStats.notStarted} not started
            </p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-green-500">
                {Math.round((ownerStats.completed / ownerStats.totalControls) * 100)}% complete
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(ownerStats.complianceRate)}%</div>
            <p className="text-xs text-muted-foreground">Target: 85% compliance</p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-amber-500">
                {ownerStats.complianceRate >= 85 ? "Target achieved" : "Below target"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>NIST Function Distribution</CardTitle>
            <CardDescription>Controls by NIST CSF 2.0 function for {selectedOwner}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                GV: { label: "Govern", color: "#8b5cf6" },
                ID: { label: "Identify", color: "#3b82f6" },
                PR: { label: "Protect", color: "#10b981" },
                DE: { label: "Detect", color: "#f59e0b" },
                RS: { label: "Respond", color: "#ef4444" },
                RC: { label: "Recover", color: "#6366f1" },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ownerStats.functionDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                            <p className="font-bold">{payload[0].name}</p>
                            <p>Controls: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="value" name="Controls">
                    {ownerStats.functionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remediation Status</CardTitle>
            <CardDescription>Current status of remediation efforts for {selectedOwner}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                notStarted: { label: "Not Started", color: "#ef4444" },
                inProgress: { label: "In Progress", color: "#f59e0b" },
                completed: { label: "Completed", color: "#10b981" },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownerStats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {ownerStats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                            <p className="font-bold">{payload[0].name}</p>
                            <p>Controls: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "0.7rem",
                      lineHeight: "1rem",
                      paddingTop: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Distribution of compliant vs non-compliant controls for {selectedOwner}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                compliant: { label: "Compliant", color: "#10b981" },
                nonCompliant: { label: "Non-Compliant", color: "#ef4444" },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Compliant", value: ownerStats.compliantControls, fill: "#10b981" },
                      { name: "Non-Compliant", value: ownerStats.nonCompliantControls, fill: "#ef4444" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                            <p className="font-bold">{payload[0].name}</p>
                            <p>Controls: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "0.7rem",
                      lineHeight: "1rem",
                      paddingTop: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Priority</CardTitle>
            <CardDescription>Distribution of non-compliant controls by priority for {selectedOwner}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                high: { label: "High", color: "#ef4444" },
                medium: { label: "Medium", color: "#f59e0b" },
                low: { label: "Low", color: "#10b981" },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownerStats.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {ownerStats.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                            <p className="font-bold">{payload[0].name}</p>
                            <p>Controls: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "0.7rem",
                      lineHeight: "1rem",
                      paddingTop: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
