"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getControls, getControlStats } from "@/lib/db-connection"
import type { ControlStats } from "@/lib/types"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { RefreshButton } from "@/components/refresh-button"

export default function DashboardPage() {
  const [controls, setControls] = useState<any[]>([])
  const [stats, setStats] = useState<ControlStats>({
    totalControls: 0,
    compliantControls: 0,
    nonCompliantControls: 0,
    complianceRate: 0,
    highPriorityControls: 0,
    mediumPriorityControls: 0,
    lowPriorityControls: 0,
    notStartedControls: 0,
    inProgressControls: 0,
    completedControls: 0,
    functionDistribution: {},
  })
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // State for storing calculated metrics
  const [statsOld, setStatsOld] = useState({
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

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading dashboard data...")
        const controlsData = await getControls()
        const statsData = await getControlStats()

        console.log("Controls loaded:", controlsData.length)
        console.log("Stats loaded:", statsData)

        setControls(controlsData)
        setStats(statsData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]
  const STATUS_COLORS = {
    "Not Started": "#FF8042",
    "In Progress": "#FFBB28",
    Completed: "#00C49F",
  }
  const PRIORITY_COLORS = {
    High: "#FF8042",
    Medium: "#FFBB28",
    Low: "#00C49F",
  }
  const COMPLIANCE_COLORS = {
    Compliant: "#00C49F",
    "Non-Compliant": "#FF8042",
  }

  // Prepare data for charts
  const complianceData = [
    { name: "Compliant", value: stats.compliantControls },
    { name: "Non-Compliant", value: stats.nonCompliantControls },
  ]

  const priorityData = [
    { name: "High", value: stats.highPriorityControls },
    { name: "Medium", value: stats.mediumPriorityControls },
    { name: "Low", value: stats.lowPriorityControls },
  ]

  const statusData = [
    { name: "Not Started", value: stats.notStartedControls },
    { name: "In Progress", value: stats.inProgressControls },
    { name: "Completed", value: stats.completedControls },
  ]

  const functionData = Object.entries(stats.functionDistribution).map(([name, value]) => ({
    name,
    value,
  }))

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

      setStatsOld({
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
  const complianceDataOld = [
    { name: "Compliant", value: statsOld.compliantControls, color: "#10b981" },
    { name: "Non-Compliant", value: statsOld.nonCompliantControls, color: "#ef4444" },
  ]

  const priorityDataOld = [
    { name: "High", value: statsOld.highPriorityIssues, color: "#ef4444" },
    { name: "Medium", value: statsOld.mediumPriorityIssues, color: "#f59e0b" },
    { name: "Low", value: statsOld.lowPriorityIssues, color: "#10b981" },
  ]

  const remediationDataOld = [
    { name: "Not Started", value: statsOld.notStarted, color: "#ef4444" },
    { name: "In Progress", value: statsOld.inProgress, color: "#f59e0b" },
    { name: "Completed", value: statsOld.completed, color: "#10b981" },
  ]

  // Update the functionData mapping to include a consistent blue color
  const functionDataOld = Object.entries(statsOld.functionCounts).map(([name, value]) => ({
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (false) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{""}</AlertDescription>
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

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityControls}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.highPriorityControls / stats.totalControls) * 100)}% of total controls
            </p>
            <Progress
              value={(stats.highPriorityControls / stats.totalControls) * 100}
              className="h-2 mt-2"
              indicatorClassName="bg-amber-500"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remediation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedControls}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedControls / stats.totalControls) * 100)}% completed
            </p>
            <Progress
              value={(stats.completedControls / stats.totalControls) * 100}
              className="h-2 mt-2"
              indicatorClassName="bg-green-500"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NIST Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.functionDistribution).length}</div>
            <p className="text-xs text-muted-foreground">{Object.keys(stats.functionDistribution).join(", ")}</p>
            <Progress value={100} className="h-2 mt-2" indicatorClassName="bg-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {complianceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COMPLIANCE_COLORS[entry.name as keyof typeof COMPLIANCE_COLORS] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NIST Function Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={functionData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Remediation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          {/* Compliance-specific charts would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance by NIST Function</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Detailed compliance charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="mt-6">
          {/* Priority-specific charts would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution by Function</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Detailed priority charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          {/* Status-specific charts would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Remediation Status by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Detailed status charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
