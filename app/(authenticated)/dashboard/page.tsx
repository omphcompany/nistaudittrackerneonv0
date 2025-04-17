"use client"

import { useEffect, useState } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import { ChartContainer } from "@/components/ui/chart"
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
  Line,
  Tooltip,
  RadialBar,
  RadialBarChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
  ZAxis,
  Area,
  AreaChart,
  ComposedChart,
  CartesianGrid,
} from "recharts"

export default function Dashboard() {
  const { controls, loading, error } = useData()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // State for storing calculated metrics
  const [stats, setStats] = useState({
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
    functionCounts: {} as Record<string, number>,
    domainCounts: {} as Record<string, number>,
    remediationTrend: [] as any[],
    riskByDomain: [] as any[],
    complianceByFunction: [] as any[],
    priorityMatrix: [] as any[],
    riskBurnDown: [] as any[],
    futureMonths: [] as string[],
    gapClosureData: [] as any[],
  })

  const [burndownTimeframe, setBurndownTimeframe] = useState<number>(1)

  // Calculate statistics when controls data changes
  useEffect(() => {
    if (controls.length > 0) {
      // Basic metrics
      const compliantControls = controls.filter((c) => c.meetsCriteria === "Yes").length
      const nonCompliantControls = controls.length - compliantControls
      const complianceRate = controls.length > 0 ? (compliantControls / controls.length) * 100 : 0

      const highPriorityIssues = controls.filter(
        (c) => c.assessmentPriority === "High" && c.meetsCriteria === "No",
      ).length
      const mediumPriorityIssues = controls.filter(
        (c) => c.assessmentPriority === "Medium" && c.meetsCriteria === "No",
      ).length
      const lowPriorityIssues = controls.filter(
        (c) => c.assessmentPriority === "Low" && c.meetsCriteria === "No",
      ).length

      const notStarted = controls.filter((c) => c.remediationStatus === "Not Started").length
      const inProgress = controls.filter((c) => c.remediationStatus === "In Progress").length
      const completed = controls.filter((c) => c.remediationStatus === "Completed").length

      // Count by NIST function
      const functionCounts: Record<string, number> = {}
      const functionCompliance: Record<string, { total: number; compliant: number }> = {}

      controls.forEach((control) => {
        // Extract just the function code (e.g., "Govern (GV)" -> "GV")
        const functionMatch = control.nistFunction.match(/$$([^)]+)$$/)
        const functionCode = functionMatch ? functionMatch[1] : control.nistFunction

        functionCounts[functionCode] = (functionCounts[functionCode] || 0) + 1

        if (!functionCompliance[functionCode]) {
          functionCompliance[functionCode] = { total: 0, compliant: 0 }
        }

        functionCompliance[functionCode].total += 1
        if (control.meetsCriteria === "Yes") {
          functionCompliance[functionCode].compliant += 1
        }
      })

      // Count by cybersecurity domain
      const domainCounts: Record<string, number> = {}
      const domainRisks: Record<string, { domain: string; high: number; medium: number; low: number }> = {}

      controls.forEach((control) => {
        if (!control.cybersecurityDomain) return

        domainCounts[control.cybersecurityDomain] = (domainCounts[control.cybersecurityDomain] || 0) + 1

        if (!domainRisks[control.cybersecurityDomain]) {
          domainRisks[control.cybersecurityDomain] = {
            domain: control.cybersecurityDomain,
            high: 0,
            medium: 0,
            low: 0,
          }
        }

        if (control.meetsCriteria === "No") {
          if (control.assessmentPriority === "High") {
            domainRisks[control.cybersecurityDomain].high += 1
          } else if (control.assessmentPriority === "Medium") {
            domainRisks[control.cybersecurityDomain].medium += 1
          } else {
            domainRisks[control.cybersecurityDomain].low += 1
          }
        }
      })

      // Create priority matrix data (scatter plot)
      const priorityMatrix = controls.map((control, index) => {
        // Create a numeric value for compliance status
        const complianceValue = control.meetsCriteria === "Yes" ? 100 : 0

        // Create a numeric value for priority
        let priorityValue = 0
        if (control.assessmentPriority === "High") priorityValue = 3
        else if (control.assessmentPriority === "Medium") priorityValue = 2
        else priorityValue = 1

        // Create a numeric value for remediation status
        let remediationValue = 0
        if (control.remediationStatus === "Completed") remediationValue = 3
        else if (control.remediationStatus === "In Progress") remediationValue = 2
        else remediationValue = 1

        return {
          id: index,
          x: priorityValue,
          y: remediationValue,
          z: complianceValue,
          name: control.nistSubCategoryId,
          description: control.controlDescription,
          priority: control.assessmentPriority,
          status: control.remediationStatus,
          compliant: control.meetsCriteria,
        }
      })

      // Mock remediation trend data (in a real app, this would come from historical data)
      const remediationTrend = [
        { month: "Jan", completed: Math.floor(completed * 0.2), inProgress: Math.floor(inProgress * 0.1), target: 10 },
        { month: "Feb", completed: Math.floor(completed * 0.3), inProgress: Math.floor(inProgress * 0.2), target: 20 },
        { month: "Mar", completed: Math.floor(completed * 0.4), inProgress: Math.floor(inProgress * 0.3), target: 30 },
        { month: "Apr", completed: Math.floor(completed * 0.5), inProgress: Math.floor(inProgress * 0.4), target: 40 },
        { month: "May", completed: Math.floor(completed * 0.6), inProgress: Math.floor(inProgress * 0.5), target: 50 },
        { month: "Jun", completed: Math.floor(completed * 0.7), inProgress: Math.floor(inProgress * 0.6), target: 60 },
        { month: "Jul", completed: Math.floor(completed * 0.8), inProgress: Math.floor(inProgress * 0.7), target: 70 },
        { month: "Aug", completed: Math.floor(completed * 0.9), inProgress: Math.floor(inProgress * 0.8), target: 80 },
        { month: "Sep", completed: completed, inProgress: inProgress, target: 90 },
      ]

      // Create risk burn down data (projecting future risk reduction)
      const currentMonth = new Date().toLocaleString("default", { month: "short" })
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const currentMonthIndex = months.findIndex((m) => m === currentMonth)
      const futureMonths = [...months.slice(currentMonthIndex), ...months.slice(0, currentMonthIndex)].slice(0, 12)

      // Calculate gap closure data
      const gapClosureData = futureMonths
        .map((month, index) => {
          const totalGaps = nonCompliantControls
          const closureRate = 0.15 // 15% per month
          const closedGaps = Math.min(totalGaps, Math.round(totalGaps * (index * closureRate)))
          const remainingGaps = totalGaps - closedGaps

          return {
            month,
            remaining: remainingGaps,
            closed: closedGaps,
            target: Math.max(0, totalGaps - Math.round(totalGaps * (index * 0.2))),
          }
        })
        .slice(0, 8)

      // Create risk burn down data (projecting future risk reduction)
      const totalCurrentRisks = highPriorityIssues + mediumPriorityIssues + lowPriorityIssues
      const riskBurnDown = futureMonths.map((month, index) => {
        // Calculate a reduction factor that gradually reduces risks over the year
        const reductionFactor = Math.max(0, 1 - index * 0.08)

        return {
          month,
          highRisks: Math.round(highPriorityIssues * reductionFactor),
          mediumRisks: Math.round(mediumPriorityIssues * reductionFactor),
          lowRisks: Math.round(lowPriorityIssues * reductionFactor),
          total: Math.round((highPriorityIssues + mediumPriorityIssues + lowPriorityIssues) * reductionFactor),
          target: Math.round(totalCurrentRisks * Math.max(0, 1 - index * 0.1)),
        }
      })

      // Prepare compliance by function data
      const complianceByFunction = Object.entries(functionCompliance).map(([name, data]) => ({
        name,
        value: data.total,
        compliantRate: Math.round((data.compliant / data.total) * 100),
        compliant: data.compliant,
        nonCompliant: data.total - data.compliant,
        fill: getColorForFunction(name),
      }))

      // Prepare risk by domain data
      const riskByDomain = Object.values(domainRisks)
        .filter((domain) => domain.high > 0 || domain.medium > 0 || domain.low > 0)
        .sort((a, b) => b.high * 3 + b.medium * 2 + b.low - (a.high * 3 + a.medium * 2 + a.low))
        .slice(0, 5)

      setStats({
        totalControls: controls.length,
        compliantControls,
        nonCompliantControls,
        complianceRate,
        highPriorityIssues,
        mediumPriorityIssues,
        lowPriorityIssues,
        notStarted,
        inProgress,
        completed,
        functionCounts,
        domainCounts,
        remediationTrend,
        riskByDomain,
        complianceByFunction,
        priorityMatrix,
        riskBurnDown,
        futureMonths,
        gapClosureData,
      })
    }
  }, [controls])

  // Prepare data for charts
  const complianceData = [
    { name: "Compliant", value: stats.compliantControls, color: "#10b981" },
    { name: "Non-Compliant", value: stats.nonCompliantControls, color: "#ef4444" },
  ]

  const priorityData = [
    { name: "High", value: stats.highPriorityIssues, color: "#ef4444" },
    { name: "Medium", value: stats.mediumPriorityIssues, color: "#f59e0b" },
    { name: "Low", value: stats.lowPriorityIssues, color: "#10b981" },
  ]

  const remediationData = [
    { name: "Not Started", value: stats.notStarted, color: "#ef4444" },
    { name: "In Progress", value: stats.inProgress, color: "#f59e0b" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ]

  // Update the functionData mapping to include a consistent blue color
  const functionData = Object.entries(stats.functionCounts).map(([name, value]) => ({
    name,
    value,
    color: "#3b82f6", // Use a consistent blue color instead of function-specific colors
  }))

  // Helper function to get color for NIST function
  function getColorForFunction(func: string) {
    const colors: Record<string, string> = {
      GV: "#8b5cf6", // Govern - Purple
      ID: "#3b82f6", // Identify - Blue
      PR: "#10b981", // Protect - Green
      DE: "#f59e0b", // Detect - Amber
      RS: "#ef4444", // Respond - Red
      RC: "#6366f1", // Recover - Indigo
    }

    return colors[func] || "#64748b" // Default slate
  }

  // Helper functions for colors
  function getPriorityColor(priority: string) {
    switch (priority) {
      case "High":
        return "#ef4444"
      case "Medium":
        return "#f59e0b"
      case "Low":
        return "#10b981"
      default:
        return "#64748b"
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Completed":
        return "#10b981"
      case "In Progress":
        return "#f59e0b"
      case "Not Started":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
          <h1 className="text-3xl font-bold mb-2">NIST CSF 2.0 Controls Dashboard</h1>
          <p className="text-muted-foreground">
            Track and monitor your NIST controls compliance and remediation status
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalControls}</div>
            <p className="text-xs text-muted-foreground">
              {stats.compliantControls} compliant, {stats.nonCompliantControls} non-compliant
            </p>
            <Progress
              value={stats.complianceRate}
              className="h-2 mt-2"
              indicatorClassName={stats.complianceRate > 50 ? "bg-green-500" : "bg-amber-500"}
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mediumPriorityIssues} medium, {stats.lowPriorityIssues} low priority issues
            </p>
            <div className="flex items-center mt-2">
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs text-red-500">Requires immediate attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remediation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgress} in progress, {stats.notStarted} not started
            </p>
            <div className="flex items-center mt-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">
                {Math.round((stats.completed / stats.totalControls) * 100)}% complete
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.complianceRate)}%</div>
            <p className="text-xs text-muted-foreground">Target: 85% compliance</p>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-xs text-amber-500">
                {stats.complianceRate >= 85 ? "Target achieved" : "Below target"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <div className="w-full">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-black">
            <TabsTrigger
              value="overview"
              className="text-white hover:bg-[#07315A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="gap-analysis"
              className="text-white hover:bg-[#07315A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="text-white hover:bg-[#07315A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="risk"
              className="text-white hover:bg-[#07315A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="text-white hover:bg-[#07315A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Trends
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Basic charts from original dashboard */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Distribution of compliant vs non-compliant controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      compliant: { label: "Compliant", color: "#10b981" },
                      nonCompliant: { label: "Non-Compliant", color: "#ef4444" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={complianceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {complianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                  <p className="font-bold">{payload[0].name}</p>
                                  <p>Value: {payload[0].value}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Issue Priority</CardTitle>
                  <CardDescription>Distribution of non-compliant controls by priority</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      high: { label: "High", color: "#ef4444" },
                      medium: { label: "Medium", color: "#f59e0b" },
                      low: { label: "Low", color: "#10b981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                  <p className="font-bold">{payload[0].name}</p>
                                  <p>Value: {payload[0].value}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="value" nameKey="name">
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Remediation Status</CardTitle>
                  <CardDescription>Current status of remediation efforts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      notStarted: { label: "Not Started", color: "#ef4444" },
                      inProgress: { label: "In Progress", color: "#f59e0b" },
                      completed: { label: "Completed", color: "#10b981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={remediationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {remediationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                  <p className="font-bold">{payload[0].name}</p>
                                  <p>Value: {payload[0].value}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>NIST Functions Distribution</CardTitle>
                  <CardDescription>Controls by NIST CSF 2.0 function</CardDescription>
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
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={functionData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                  <p className="font-bold">{payload[0].name}</p>
                                  <p>Value: {payload[0].value}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="value" nameKey="name" name="Distribution">
                          {functionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#3b82f6" />
                          ))}
                        </Bar>
                        <Legend
                          formatter={(value) => {
                            return <span style={{ color: "#3b82f6" }}>{value}</span>
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* GAP ANALYSIS TAB */}
          <TabsContent value="gap-analysis" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Radial Bar Chart */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle>Control Gap Analysis</CardTitle>
                  <CardDescription>Radial view of NIST control gaps</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        complianceRate: { label: "Compliance Rate", color: "#3b82f6" },
                        remediationRate: { label: "Remediation Rate", color: "#10b981" },
                        highPriorityIssues: { label: "High Priority Issues", color: "#ef4444" },
                      }}
                      className="h-[350px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="20%"
                          outerRadius="90%"
                          barSize={20}
                          data={[
                            {
                              name: "Compliance Gap",
                              value: 100 - stats.complianceRate,
                              fill: "#ef4444",
                            },
                            {
                              name: "Remediation Gap",
                              value: 100 - (stats.completed / stats.totalControls) * 100,
                              fill: "#f59e0b",
                            },
                            {
                              name: "High Risk Controls",
                              value: (stats.highPriorityIssues / stats.totalControls) * 100,
                              fill: "#3b82f6",
                            },
                          ]}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={10}
                            label={{
                              position: "insideStart",
                              fill: isDark ? "#fff" : "#333",
                              formatter: (value: number) => `${Math.round(value)}%`,
                            }}
                          />
                          <Legend
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: "10px" }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].name}</p>
                                    <p>Value: {Math.round(payload[0].value)}%</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle>NIST Function Balance</CardTitle>
                  <CardDescription>Radar view of controls distribution</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        controls: { label: "Controls", color: "#8884d8" },
                      }}
                      className="h-[350px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          outerRadius="80%"
                          data={Object.entries(stats.functionCounts).map(([name, value]) => ({
                            subject: name,
                            A: value,
                            fullMark: Math.max(...Object.values(stats.functionCounts)) * 1.2,
                            fill: getColorForFunction(name),
                          }))}
                        >
                          <PolarGrid stroke={isDark ? "#444" : "#ddd"} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? "#fff" : "#333" }} />
                          <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                          <Radar name="Controls" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].payload.subject}</p>
                                    <p>Controls: {payload[0].value}</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gaps by NIST Sub-Category ID */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardTitle>Gaps by NIST Sub-Category</CardTitle>
                  <CardDescription>Top non-compliant NIST sub-categories</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <div className="h-[400px] flex justify-center items-center">
                      <ChartContainer
                        config={{
                          gapCount: { label: "Gap Count", color: "#ef4444" },
                        }}
                        className="h-[400px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={controls
                              .filter((c) => c.meetsCriteria === "No")
                              .reduce((acc, control) => {
                                const existing = acc.find((item) => item.id === control.nistSubCategoryId)
                                if (existing) {
                                  existing.count += 1
                                  if (control.assessmentPriority === "High") existing.highCount += 1
                                } else {
                                  acc.push({
                                    id: control.nistSubCategoryId,
                                    title:
                                      control.controlDescription.length > 30
                                        ? control.controlDescription.substring(0, 30) + "..."
                                        : control.controlDescription,
                                    count: 1,
                                    highCount: control.assessmentPriority === "High" ? 1 : 0,
                                    description: control.controlDescription,
                                  })
                                }
                                return acc
                              }, [] as any[])
                              .sort((a, b) => b.highCount - a.highCount || b.count - a.count)
                              .slice(0, 8)}
                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                            <XAxis type="number" />
                            <YAxis dataKey="title" type="category" width={140} tick={{ fontSize: 11 }} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                      <p className="font-bold">{data.id}</p>
                                      <p>{data.description}</p>
                                      <p>Gap Count: {data.count}</p>
                                      <p>High Priority: {data.highCount}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="count" fill="#ef4444" name="Gap Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gap Closure Projection */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <CardTitle>Gap Closure Projection</CardTitle>
                  <CardDescription>Estimated timeline for closing control gaps</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        remaining: { label: "Remaining Gaps", color: "#ef4444" },
                        closed: { label: "Closed Gaps", color: "#10b981" },
                        target: { label: "Target", color: "#3b82f6" },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.gapClosureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].payload.month}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ color: entry.color }}>
                                        {entry.name}: {entry.value}
                                      </p>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="closed"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                            name="Closed Gaps"
                          />
                          <Area
                            type="monotone"
                            dataKey="remaining"
                            stackId="1"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.6}
                            name="Remaining Gaps"
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Target"
                            dot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* COMPLIANCE TAB */}
          <TabsContent value="compliance" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stacked Bar Chart - Compliance by NIST Function */}

              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle>Compliance by NIST Function</CardTitle>
                  <CardDescription>Compliance rate for each NIST CSF 2.0 function</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartContainer
                    config={{
                      compliantRate: { label: "Compliance Rate", color: "#09b079" },
                    }}
                    className="h-[350px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.complianceByFunction.map((func) => ({
                          ...func,
                          fill: "#09b079", // Add fill color directly to each data point
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                  <p className="font-bold">{data.name}</p>
                                  <p>Compliance Rate: {data.compliantRate}%</p>
                                  <p>Compliant: {data.compliant}</p>
                                  <p>Non-Compliant: {data.nonCompliant}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            return <span style={{ color: "#09b079" }}>{value}</span>
                          }}
                        />
                        <Bar dataKey="compliantRate" name="Compliance Rate (%)">
                          {stats.complianceByFunction.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#09b079" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Pie Chart with Animation */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle>Compliance Distribution</CardTitle>
                  <CardDescription>Animated pie chart of compliance status</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
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
                              { name: "Compliant", value: stats.compliantControls, fill: "#10b981" },
                              { name: "Non-Compliant", value: stats.nonCompliantControls, fill: "#ef4444" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].name}</p>
                                    <p>Value: {payload[0].value}</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Scatter Plot */}
              <Card className="col-span-2 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <CardTitle>Control Priority Matrix</CardTitle>
                  <CardDescription>
                    Scatter plot of controls by priority, remediation status, and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        controls: { label: "Controls", color: "#8884d8" },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name="Priority"
                            domain={[0, 4]}
                            tickFormatter={(value) => {
                              switch (value) {
                                case 1:
                                  return "Low"
                                case 2:
                                  return "Medium"
                                case 3:
                                  return "High"
                                default:
                                  return ""
                              }
                            }}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name="Status"
                            domain={[0, 4]}
                            tickFormatter={(value) => {
                              switch (value) {
                                case 1:
                                  return "Not Started"
                                case 2:
                                  return "In Progress"
                                case 3:
                                  return "Completed"
                                default:
                                  return ""
                              }
                            }}
                          />
                          <ZAxis type="number" dataKey="z" range={[50, 400]} name="Compliance" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{data.name}</p>
                                    <p className="text-sm">{data.description}</p>
                                    <div className="mt-2">
                                      <p>
                                        Priority:{" "}
                                        <span style={{ color: getPriorityColor(data.priority) }}>{data.priority}</span>
                                      </p>
                                      <p>
                                        Status:{" "}
                                        <span style={{ color: getStatusColor(data.status) }}>{data.status}</span>
                                      </p>
                                      <p>
                                        Compliant:{" "}
                                        <span style={{ color: data.compliant === "Yes" ? "#10b981" : "#ef4444" }}>
                                          {data.compliant}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Scatter
                            name="Controls"
                            data={stats.priorityMatrix}
                            fill="#8884d8"
                            shape={(props) => {
                              const { cx, cy, fill, payload } = props
                              const color = payload.compliant === "Yes" ? "#10b981" : "#ef4444"
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={payload.z / 25}
                                  fill={color}
                                  stroke="#fff"
                                  strokeWidth={1}
                                  style={{ opacity: 0.8 }}
                                />
                              )
                            }}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RISK ANALYSIS TAB */}
          <TabsContent value="risk" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stacked Bar Chart for Risk by Domain */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                  <CardTitle>Risk by Cybersecurity Domain</CardTitle>
                  <CardDescription>Top 5 domains with highest risk exposure</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <div className="h-[400px] flex justify-center items-center">
                      <ChartContainer
                        config={{
                          high: { label: "High Priority", color: "#ef4444" },
                          medium: { label: "Medium Priority", color: "#f59e0b" },
                          low: { label: "Low Priority", color: "#10b981" },
                        }}
                        className="h-[400px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.riskByDomain}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                            <XAxis type="number" />
                            <YAxis dataKey="domain" type="category" width={140} tick={{ fontSize: 12 }} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                      {payload.map((entry, index) => (
                                        <p key={index} style={{ color: entry.color }}>
                                          {entry.name}: {entry.value}
                                        </p>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Legend />
                            <Bar dataKey="high" stackId="a" name="High Priority" fill="#ef4444" />
                            <Bar dataKey="medium" stackId="a" name="Medium Priority" fill="#f59e0b" />
                            <Bar dataKey="low" stackId="a" name="Low Priority" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Burn Down Chart */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <CardTitle>Risk Burn Down Projection</CardTitle>
                  <CardDescription>Projected risk reduction over time</CardDescription>
                </CardHeader>
                <div className="px-6 pt-2 pb-0 flex justify-center">
                  <div className="inline-flex rounded-md shadow-sm">
                    <button
                      onClick={() => setBurndownTimeframe(1)}
                      className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                        burndownTimeframe === 1 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      1 Year
                    </button>
                    <button
                      onClick={() => setBurndownTimeframe(2)}
                      className={`px-4 py-2 text-sm font-medium ${
                        burndownTimeframe === 2 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }\`}  : "bg-muted hover:bg-muted/80"
                                            }`}
                    >
                      2 Years
                    </button>
                    <button
                      onClick={() => setBurndownTimeframe(3)}
                      className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                        burndownTimeframe === 3 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      3 Years
                    </button>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        total: { label: "Total Risks", color: "#64748b" },
                        highRisks: { label: "High Priority", color: "#ef4444" },
                        mediumRisks: { label: "Medium Priority", color: "#f59e0b" },
                        lowRisks: { label: "Low Priority", color: "#10b981" },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={stats.riskBurnDown.slice(0, burndownTimeframe * 4)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].payload.month}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ color: entry.color }}>
                                        {entry.name}: {entry.value}
                                      </p>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="highRisks"
                            stackId="1"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.6}
                            name="High Priority"
                          />
                          <Area
                            type="monotone"
                            dataKey="mediumRisks"
                            stackId="1"
                            stroke="#f59e0b"
                            fill="#f59e0b"
                            fillOpacity={0.6}
                            name="Medium Priority"
                          />
                          <Area
                            type="monotone"
                            dataKey="lowRisks"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                            name="Low Priority"
                          />
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#64748b"
                            strokeWidth={2}
                            name="Total Risks"
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#3b82f6"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            name="Target"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Chart for Risk Distribution */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Radar view of risk factors</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        riskFactors: { label: "Risk Factors", color: "#ef4444" },
                      }}
                      className="h-[350px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          outerRadius="80%"
                          data={[
                            {
                              subject: "High Priority Issues",
                              A: stats.highPriorityIssues,
                              fullMark: stats.totalControls,
                            },
                            { subject: "Non-Compliant", A: stats.nonCompliantControls, fullMark: stats.totalControls },
                            { subject: "Not Started", A: stats.notStarted, fullMark: stats.totalControls },
                            { subject: "In Progress", A: stats.inProgress, fullMark: stats.totalControls },
                            {
                              subject: "Identified Risks",
                              A: stats.nonCompliantControls,
                              fullMark: stats.totalControls,
                            },
                          ]}
                        >
                          <PolarGrid stroke={isDark ? "#444" : "#ddd"} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? "#fff" : "#333" }} />
                          <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                          <Radar name="Risk Factors" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].payload.subject}</p>
                                    <p>Value: {payload[0].value}</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Heat Map-like Visualization */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle>Risk Heatmap</CardTitle>
                  <CardDescription>Visualizing risk concentration</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        value: { label: "Value", color: "#413ea0" },
                        line: { label: "Line", color: "#ff7300" },
                      }}
                      className="h-[350px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={[
                            { name: "High", value: stats.highPriorityIssues, color: "#ef4444", opacity: 0.9 },
                            { name: "Medium", value: stats.mediumPriorityIssues, color: "#f59e0b", opacity: 0.7 },
                            { name: "Low", value: stats.lowPriorityIssues, color: "#10b981", opacity: 0.5 },
                          ]}
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid stroke={isDark ? "#444" : "#ddd"} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].name}</p>
                                    <p>Value: {payload[0].value}</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="value" barSize={60} fill="#413ea0">
                            {[
                              { name: "High", value: stats.highPriorityIssues, color: "#ef4444", opacity: 0.9 },
                              { name: "Medium", value: stats.mediumPriorityIssues, color: "#f59e0b", opacity: 0.7 },
                              { name: "Low", value: stats.lowPriorityIssues, color: "#10b981", opacity: 0.5 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={entry.opacity} />
                            ))}
                          </Bar>
                          <Line type="monotone" dataKey="value" stroke="#ff7300" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TRENDS TAB */}
          <TabsContent value="trends" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Area Chart - Full Width */}
              <Card className="col-span-2 overflow-hidden w-full">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardTitle>Remediation Progress Over Time</CardTitle>
                  <CardDescription>Area chart showing remediation trends</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <div className="h-[400px] flex justify-center items-center w-full">
                      <ChartContainer
                        config={{
                          completed: { label: "Completed", color: "#10b981" },
                          inProgress: { label: "In Progress", color: "#f59e0b" },
                          target: { label: "Target", color: "#8884d8" },
                        }}
                        className="h-[400px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.remediationTrend} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                      <p className="font-bold">{payload[0].payload.month}</p>
                                      {payload.map((entry, index) => (
                                        <p key={index} style={{ color: entry.color }}>
                                          {entry.name}: {entry.value}
                                        </p>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="completed"
                              name="Completed"
                              stroke="#10b981"
                              fillOpacity={0.8}
                              fill="url(#colorCompleted)"
                              stackId="1"
                              animationDuration={1500}
                            />
                            <Area
                              type="monotone"
                              dataKey="inProgress"
                              name="In Progress"
                              stroke="#f59e0b"
                              fillOpacity={0.8}
                              fill="url(#colorInProgress)"
                              stackId="1"
                              animationDuration={1500}
                            />
                            <Line
                              type="monotone"
                              dataKey="target"
                              name="Target"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              animationDuration={1500}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Composed Chart */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle>Compliance Trend</CardTitle>
                  <CardDescription>Multi-type chart showing compliance metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        compliance: { label: "Compliance Rate", color: "#3b82f6" },
                        gap: { label: "Gap to Target", color: "#ef4444" },
                        target: { label: "Target", color: "#10b981" },
                      }}
                      className="h-[350px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={[
                            {
                              name: "Current",
                              compliance: stats.complianceRate,
                              target: 85,
                              gap: 85 - stats.complianceRate,
                            },
                            {
                              name: "Q1",
                              compliance: Math.max(0, stats.complianceRate - 15),
                              target: 85,
                              gap: 85 - Math.max(0, stats.complianceRate - 15),
                            },
                            {
                              name: "Q2",
                              compliance: Math.max(0, stats.complianceRate - 10),
                              target: 85,
                              gap: 85 - Math.max(0, stats.complianceRate - 10),
                            },
                            {
                              name: "Q3",
                              compliance: Math.max(0, stats.complianceRate - 5),
                              target: 85,
                              gap: 85 - Math.max(0, stats.complianceRate - 5),
                            },
                            {
                              name: "Q4",
                              compliance: stats.complianceRate,
                              target: 85,
                              gap: 85 - stats.complianceRate,
                            },
                          ]}
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid stroke={isDark ? "#444" : "#ddd"} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{payload[0].payload.name}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ color: entry.color }}>
                                        {entry.name}: {Math.round(entry.value)}%
                                      </p>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Bar dataKey="compliance" name="Compliance Rate" barSize={20} fill="#3b82f6" />
                          <Bar dataKey="gap" name="Gap to Target" barSize={20} fill="#ef4444" />
                          <Line type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bubble Chart */}
              <Card className="col-span-1 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle>Function Performance</CardTitle>
                  <CardDescription>Bubble chart of function metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        functions: { label: "Functions", color: "#8884d8" },
                      }}
                      className="h-[350px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                          <XAxis type="number" dataKey="value" name="Controls" domain={[0, "auto"]} />
                          <YAxis type="number" dataKey="compliantRate" name="Compliance Rate" domain={[0, 100]} />
                          <ZAxis type="number" range={[100, 500]} name="Size" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                    <p className="font-bold">{data.name}</p>
                                    <p>Controls: {data.value}</p>
                                    <p>Compliance Rate: {data.compliantRate}%</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Scatter
                            name="Functions"
                            data={stats.complianceByFunction.map((f) => ({
                              ...f,
                              z: f.value * 5, // Size based on number of controls
                            }))}
                            fill="#8884d8"
                          >
                            {stats.complianceByFunction.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
