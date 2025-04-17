"use client"

import { useEffect, useState } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, XAxis, YAxis, Legend, Tooltip } from "recharts"

export default function ComplianceReport() {
  const { controls, loading, error } = useData()
  const [reportData, setReportData] = useState({
    byFunction: [] as any[],
    byDomain: [] as any[],
    byCategory: [] as any[],
  })

  useEffect(() => {
    if (controls.length > 0) {
      try {
        // Compliance by NIST Function
        const functionMap = new Map<string, { total: number; compliant: number }>()

        controls.forEach((control) => {
          if (!functionMap.has(control.nistFunction)) {
            functionMap.set(control.nistFunction, { total: 0, compliant: 0 })
          }

          const data = functionMap.get(control.nistFunction)!
          data.total += 1
          if (control.meetsCriteria === "Yes") {
            data.compliant += 1
          }
        })

        const byFunction = Array.from(functionMap.entries()).map(([name, data]) => ({
          name,
          total: data.total,
          compliant: data.compliant,
          nonCompliant: data.total - data.compliant,
          complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
          color: getColorForFunction(name),
        }))

        // Compliance by Cybersecurity Domain
        const domainMap = new Map<string, { total: number; compliant: number }>()

        controls.forEach((control) => {
          if (!control.cybersecurityDomain) return

          if (!domainMap.has(control.cybersecurityDomain)) {
            domainMap.set(control.cybersecurityDomain, { total: 0, compliant: 0 })
          }

          const data = domainMap.get(control.cybersecurityDomain)!
          data.total += 1
          if (control.meetsCriteria === "Yes") {
            data.compliant += 1
          }
        })

        const byDomain = Array.from(domainMap.entries())
          .filter(([name]) => name) // Filter out empty domain names
          .map(([name, data]) => ({
            name,
            total: data.total,
            compliant: data.compliant,
            nonCompliant: data.total - data.compliant,
            complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
          }))
          .sort((a, b) => b.total - a.total) // Sort by total count

        // Compliance by NIST Category
        const categoryMap = new Map<string, { total: number; compliant: number }>()

        controls.forEach((control) => {
          if (!control.nistCategoryId) return

          if (!categoryMap.has(control.nistCategoryId)) {
            categoryMap.set(control.nistCategoryId, { total: 0, compliant: 0 })
          }

          const data = categoryMap.get(control.nistCategoryId)!
          data.total += 1
          if (control.meetsCriteria === "Yes") {
            data.compliant += 1
          }
        })

        const byCategory = Array.from(categoryMap.entries())
          .filter(([name]) => name) // Filter out empty category names
          .map(([name, data]) => ({
            name,
            total: data.total,
            compliant: data.compliant,
            nonCompliant: data.total - data.compliant,
            complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
          }))
          .sort((a, b) => b.total - a.total) // Sort by total count
          .slice(0, 10) // Take top 10

        console.log("Compliance report data calculated:", {
          byFunction: byFunction.length,
          byDomain: byDomain.length,
          byCategory: byCategory.length,
        })

        setReportData({
          byFunction,
          byDomain,
          byCategory,
        })
      } catch (error) {
        console.error("Error calculating compliance report data:", error)
      }
    }
  }, [controls])

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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Compliance Report</h1>
        <div className="grid gap-6 md:grid-cols-2">
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

  if (controls.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Compliance Report</h1>
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
      <h1 className="text-3xl font-bold mb-2">Compliance Report</h1>
      <p className="text-muted-foreground mb-6">Analyze and visualize your NIST controls compliance status</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardTitle>Compliance by NIST Function</CardTitle>
            <CardDescription>Compliance rate for each NIST CSF 2.0 function</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                compliant: { label: "Compliant", color: "#10b981" },
                nonCompliant: { label: "Non-Compliant", color: "#ef4444" },
              }}
              className="h-[300px]"
            >
              <BarChart
                data={reportData.byFunction}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Compliant" />
                <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" name="Non-Compliant" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardTitle>Compliance Rate by Function</CardTitle>
            <CardDescription>Percentage of compliant controls by function</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                complianceRate: { label: "Compliance Rate", color: "#3b82f6" },
              }}
              className="h-[300px]"
            >
              <BarChart data={reportData.byFunction} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="complianceRate" fill="#3b82f6" name="Compliance Rate (%)">
                  {reportData.byFunction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardTitle>Compliance by Cybersecurity Domain</CardTitle>
            <CardDescription>Top cybersecurity domains by compliance rate</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                compliant: { label: "Compliant", color: "#10b981" },
                nonCompliant: { label: "Non-Compliant", color: "#ef4444" },
              }}
              className="h-[300px]"
            >
              <BarChart
                data={reportData.byDomain.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Compliant" />
                <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" name="Non-Compliant" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardTitle>Top NIST Categories</CardTitle>
            <CardDescription>Compliance rate for top NIST categories</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                complianceRate: { label: "Compliance Rate", color: "#3b82f6" },
              }}
              className="h-[300px]"
            >
              <BarChart data={reportData.byCategory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="complianceRate" fill="#3b82f6" name="Compliance Rate (%)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
