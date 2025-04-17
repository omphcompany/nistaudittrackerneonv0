"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, Filter, ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshButton } from "@/components/refresh-button"

export default function ControlsExplorer() {
  const { controls, loading, error } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredControls, setFilteredControls] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" })
  const [selectedFilters, setSelectedFilters] = useState({
    function: [],
    status: [],
    priority: [],
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort controls when data changes
  useEffect(() => {
    if (!controls) return

    let filtered = [...controls]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (control) =>
          control.id.toLowerCase().includes(term) ||
          control.name.toLowerCase().includes(term) ||
          control.description.toLowerCase().includes(term),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((control) => control.function === activeTab)
    }

    // Apply advanced filters
    if (selectedFilters.function.length > 0) {
      filtered = filtered.filter((control) => selectedFilters.function.includes(control.function))
    }

    if (selectedFilters.status.length > 0) {
      filtered = filtered.filter((control) => selectedFilters.status.includes(control.status))
    }

    if (selectedFilters.priority.length > 0) {
      filtered = filtered.filter((control) => selectedFilters.priority.includes(control.priority))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredControls(filtered)
  }, [controls, searchTerm, activeTab, sortConfig, selectedFilters])

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "ascending" ? "descending" : "ascending",
    }))
  }

  const toggleFilter = (type, value) => {
    setSelectedFilters((prev) => {
      const current = [...prev[type]]
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((item) => item !== value) }
      } else {
        return { ...prev, [type]: [...current, value] }
      }
    })
  }

  const clearFilters = () => {
    setSelectedFilters({
      function: [],
      status: [],
      priority: [],
    })
    setSearchTerm("")
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Compliant":
        return <Badge className="bg-green-500">Compliant</Badge>
      case "Non-Compliant":
        return <Badge className="bg-red-500">Non-Compliant</Badge>
      case "Partially Compliant":
        return <Badge className="bg-yellow-500">Partial</Badge>
      case "Not Applicable":
        return <Badge variant="outline">N/A</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // No data state
  if (controls.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Controls Explorer</h1>
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
          <h1 className="text-3xl font-bold mb-2">Controls Explorer</h1>
          <p className="text-muted-foreground">Browse, filter, and search through your NIST CSF 2.0 controls</p>
        </div>
        <RefreshButton />
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Controls</TabsTrigger>
              <TabsTrigger value="ID">Identify</TabsTrigger>
              <TabsTrigger value="PR">Protect</TabsTrigger>
              <TabsTrigger value="DE">Detect</TabsTrigger>
              <TabsTrigger value="RS">Respond</TabsTrigger>
              <TabsTrigger value="RC">Recover</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search controls..."
                  className="w-[200px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                <CardDescription>Filter controls by multiple criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Function</h3>
                    <div className="space-y-2">
                      {["ID", "PR", "DE", "RS", "RC"].map((func) => (
                        <div key={func} className="flex items-center space-x-2">
                          <Checkbox
                            id={`function-${func}`}
                            checked={selectedFilters.function.includes(func)}
                            onCheckedChange={() => toggleFilter("function", func)}
                          />
                          <label
                            htmlFor={`function-${func}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {func}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <div className="space-y-2">
                      {["Compliant", "Non-Compliant", "Partially Compliant", "Not Applicable"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedFilters.status.includes(status)}
                            onCheckedChange={() => toggleFilter("status", status)}
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Priority</h3>
                    <div className="space-y-2">
                      {["High", "Medium", "Low"].map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={selectedFilters.priority.includes(priority)}
                            onCheckedChange={() => toggleFilter("priority", priority)}
                          />
                          <label
                            htmlFor={`priority-${priority}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {priority}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="all" className="mt-0">
            <ControlsTable
              controls={filteredControls}
              sortConfig={sortConfig}
              handleSort={handleSort}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
          <TabsContent value="ID" className="mt-0">
            <ControlsTable
              controls={filteredControls}
              sortConfig={sortConfig}
              handleSort={handleSort}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
          <TabsContent value="PR" className="mt-0">
            <ControlsTable
              controls={filteredControls}
              sortConfig={sortConfig}
              handleSort={handleSort}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
          <TabsContent value="DE" className="mt-0">
            <ControlsTable
              controls={filteredControls}
              sortConfig={sortConfig}
              handleSort={handleSort}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
          <TabsContent value="RS" className="mt-0">
            <ControlsTable
              controls={filteredControls}
              sortConfig={sortConfig}
              handleSort={handleSort}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
          <TabsContent value="RC" className="mt-0">
            <ControlsTable
              controls={filteredControls}
              sortConfig={sortConfig}
              handleSort={handleSort}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ControlsTable({ controls, sortConfig, handleSort, getStatusBadge, getPriorityBadge }) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" size="sm" onClick={() => handleSort("id")} className="flex items-center gap-1">
                  ID
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1"
                >
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("function")}
                  className="flex items-center gap-1"
                >
                  Function
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("priority")}
                  className="flex items-center gap-1"
                >
                  Priority
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("dueDate")}
                  className="flex items-center gap-1"
                >
                  Due Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              controls.map((control) => (
                <TableRow key={control.id}>
                  <TableCell className="font-medium">{control.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{control.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{control.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{control.function}</TableCell>
                  <TableCell>{getStatusBadge(control.status)}</TableCell>
                  <TableCell>{getPriorityBadge(control.priority)}</TableCell>
                  <TableCell>{control.dueDate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
