"use client"

import { useEffect, useState } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DbInitializer } from "@/components/db-initializer"
import { RefreshButton } from "@/components/refresh-button"

export default function Reports() {
  const { controls, loading, error } = useData()
  const [reportData, setReportData] = useState({
    byFunction: [] as { name: string; compliant: number; nonCompliant: number; fill: string }[],
    byDomain: [] as { name: string; value: number; fill: string }[],
    byCategory: [] as { name: string; value: number }[],
  })

  useEffect(() => {
    if (controls.length > 0) {
      // Group by function
      const functionMap = new Map<string, { compliant: number; nonCompliant: number; total: number; fill: string }>()

      // Group by domain (first word of category)
      const domainMap = new Map<string, number>()

      // Group by category
      const categoryMap = new Map<string, number>()

      // Function colors
      const functionColors: Record<string, string> = {
        GV: "#8b5cf6", // Govern - Purple
        ID: "#3b82f6", // Identify - Blue
        PR: "#10b981", // Protect - Green
        DE: "#f59e0b", // Detect - Amber
        RS: "#ef4444", // Respond - Red
        RC: "#6366f1", // Recover - Indigo
      }

      // Domain colors
      const domainColors = [
        "#3b82f6", // Blue
        "#10b981", // Green
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#8b5cf6", // Purple
        "#6366f1", // Indigo
        "#ec4899", // Pink
        "#14b8a6", // Teal
      ]

      controls.forEach((control) => {
        // Function data
        const func = control.nist_function
        const isCompliant = (control.compliance_level || 0) === 100
        if (!functionMap.has(func)) {
          functionMap.set(func, {
            compliant: 0,
            nonCompliant: 0,
            total: 0,
            fill: functionColors[func] || "#64748b",
          })
        }
        const funcData = functionMap.get(func)!
        if (isCompliant) {
          funcData.compliant++
        } else {
          funcData.nonCompliant++
        }
        funcData.total++

        // Domain data
        const domain = control.category.split(" ")[0]
        domainMap.set(domain, (domainMap.get(domain) || 0) + 1)

        // Category data
        const category = control.category
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })

      // Convert to arrays for charts
      const byFunction = Array.from(functionMap.entries()).map(([name, data]) => ({
        name,
        compliant: data.compliant,
        nonCompliant: data.nonCompliant,
        fill: data.fill,
      }))

      const byDomain = Array.from(domainMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          fill: domainColors[index % domainColors.length],
        }))
        .sort((a, b) => b.value - a.value)

      const byCategory = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      setReportData({
        byFunction,
        byDomain,
        byCategory,
      })
    }
  }, [controls])

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
        <DbInitializer />
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
        <DbInitializer />
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
      <DbInitializer />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Compliance Reports</h1>
          <p className="text-muted-foreground">Analyze your NIST CSF 2.0 controls compliance</p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance by NIST Function</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.byFunction}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliant" name="Compliant" stackId="a" fill="#10b981" />
                  <Bar dataKey="nonCompliant" name="Non-Compliant" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.byDomain}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.byDomain.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controls by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.byCategory.slice(0, 10)} // Show top 10 categories
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 150,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
