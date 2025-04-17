"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Filter, MoreHorizontal, Search } from "lucide-react"
import { RefreshButton } from "@/components/refresh-button"
import type { Control } from "@/lib/types"

export default function ControlsExplorer() {
  const { controls, loading, error, updateControl } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredControls, setFilteredControls] = useState<Control[]>([])
  const [functionFilter, setFunctionFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [complianceFilter, setComplianceFilter] = useState<string>("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [uniqueDomains, setUniqueDomains] = useState<string[]>([])
  const [uniqueFunctions, setUniqueFunctions] = useState<string[]>([])

  // Extract unique values for filters
  useEffect(() => {
    if (controls.length > 0) {
      const domains = Array.from(new Set(controls.map((c) => c.cybersecurityDomain)))
        .filter(Boolean)
        .sort()
      const functions = Array.from(new Set(controls.map((c) => c.nistFunction)))
        .filter(Boolean)
        .sort()
      setUniqueDomains(domains)
      setUniqueFunctions(functions)
    }
  }, [controls])

  // Filter controls based on search term and filters
  useEffect(() => {
    let result = [...controls]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (control) =>
          control.owner
            ?.toLowerCase()
            .includes(term) || // Added owner search
          control.nistFunction.toLowerCase().includes(term) ||
          control.nistCategoryId.toLowerCase().includes(term) ||
          control.nistSubCategoryId.toLowerCase().includes(term) ||
          control.controlDescription.toLowerCase().includes(term) ||
          control.cybersecurityDomain.toLowerCase().includes(term),
      )
    }

    // Apply function filter
    if (functionFilter !== "all") {
      result = result.filter((control) => control.nistFunction === functionFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((control) => control.assessmentPriority === priorityFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((control) => control.remediationStatus === statusFilter)
    }

    // Apply compliance filter
    if (complianceFilter !== "all") {
      result = result.filter((control) => control.meetsCriteria === (complianceFilter === "compliant" ? "Yes" : "No"))
    }

    // Apply domain filter
    if (domainFilter !== "all") {
      result = result.filter((control) => control.cybersecurityDomain === domainFilter)
    }

    setFilteredControls(result)
  }, [controls, searchTerm, functionFilter, priorityFilter, statusFilter, complianceFilter, domainFilter])

  const resetFilters = () => {
    setSearchTerm("")
    setFunctionFilter("all")
    setPriorityFilter("all")
    setStatusFilter("all")
    setComplianceFilter("all")
    setDomainFilter("all")
  }

  const handleStatusChange = async (controlId: number | undefined, newStatus: string) => {
    if (!controlId) return

    const control = controls.find((c) => c.id === controlId)
    if (!control) return

    const updatedControl = {
      ...control,
      remediationStatus: newStatus as "Not Started" | "In Progress" | "Completed",
    }

    await updateControl(updatedControl)
  }

  const handleComplianceChange = async (controlId: number | undefined, compliant: boolean) => {
    if (!controlId) return

    const control = controls.find((c) => c.id === controlId)
    if (!control) return

    const updatedControl = {
      ...control,
      meetsCriteria: compliant ? "Yes" : "No",
    }

    await updateControl(updatedControl)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Controls Explorer</h1>
      <p className="text-muted-foreground mb-6">View, filter, and manage your NIST controls</p>

      <Card>
        <CardHeader>
          <CardTitle>NIST CSF 2.0 Controls</CardTitle>
          <CardDescription>View and manage all controls. Use the filters to narrow down the results.</CardDescription>
        </CardHeader>
        <CardContent>
          {controls.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>
                No controls data found. Please upload data in the Data Management section.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search controls..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                  <Filter className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
                <RefreshButton />
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Select value={functionFilter} onValueChange={setFunctionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="NIST Function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Functions</SelectItem>
                    {uniqueFunctions.map((func) => (
                      <SelectItem key={func} value={func}>
                        {func}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {uniqueDomains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Controls Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">ID</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredControls.map((control) => (
                      <TableRow key={control.id}>
                        <TableCell className="font-medium">
                          <div>{control.nistSubCategoryId}</div>
                          <div className="text-xs text-muted-foreground">{control.nistFunction}</div>
                        </TableCell>
                        <TableCell>{control.owner}</TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate" title={control.controlDescription}>
                            {control.controlDescription}
                          </div>
                        </TableCell>
                        <TableCell>{control.cybersecurityDomain}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              control.assessmentPriority === "High"
                                ? "border-red-500 text-red-500"
                                : control.assessmentPriority === "Medium"
                                  ? "border-amber-500 text-amber-500"
                                  : "border-green-500 text-green-500"
                            }
                          >
                            {control.assessmentPriority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={control.remediationStatus}
                            onValueChange={(value) => handleStatusChange(control.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={control.meetsCriteria}
                            onValueChange={(value) => handleComplianceChange(control.id, value === "Yes")}
                          >
                            <SelectTrigger className="h-8 w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Control</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredControls.length} of {controls.length} controls
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
