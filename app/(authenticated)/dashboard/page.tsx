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
import { RefreshButton } from "@/components/refresh-button"
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
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
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
        const functionMatch = control.nistFunction.match(/$([^)]+)$/)
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
        <h1 className="text-3xl font-bold mb-6">Controls Dashboard</h1>
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
        <h1 className="text-3xl font-bold mb-6">Controls Dashboard</h1>
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
          <h1 className="text-3xl font-bold mb-2">Controls Dashboard</h1>
          <p className="text-muted-foreground">
            Track and monitor your NIST controls compliance and remediation status
          </p>
        </div>
        <RefreshButton />
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
                        <Legend
                          wrapperStyle={{
                            fontSize: "0.7rem", // Smaller font size
                            lineHeight: "1rem",
                            paddingTop: "0.5rem",
                          }}
                        />
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
                                  <p>Priority: {payload[0].value}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="value" nameKey="name" name="Priority">
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        <Legend
                          wrapperStyle={{
                            fontSize: "0.7rem", // Smaller font size
                            lineHeight: "1rem",
                            paddingTop: "0.5rem",
                          }}
                        />
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
                        <Legend
                          wrapperStyle={{
                            fontSize: "0.7rem", // Smaller font size
                            lineHeight: "1rem",
                            paddingTop: "0.5rem",
                          }}
                        />
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
                          wrapperStyle={{
                            fontSize: "0.7rem", // Smaller font size
                            lineHeight: "1rem",
                            paddingTop: "0.5rem",
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
                            wrapperStyle={{
                              fontSize: "0.7rem", // Smaller font size
                              lineHeight: "1rem",
                              paddingTop: "0.5rem",
                            }}
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

              {/* Rest of the dashboard content continues... */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
