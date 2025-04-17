"use client"

import { useState, useMemo } from "react"
import { useData } from "@/contexts/data-context"
import type { NistControl } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, Filter, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { RefreshButton } from "@/components/refresh-button"

export default function ControlsExplorer() {
  const { controls, loading, error, updateControl } = useData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [functionFilter, setFunctionFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [complianceFilter, setComplianceFilter] = useState<string>("")
  const [ownerFilter, setOwnerFilter] = useState<string>("")

  const [editingControl, setEditingControl] = useState<NistControl | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Extract unique values for filters
  const nistFunctions = useMemo(() => {
    const functions = new Set(controls.map((c) => c.nistFunction))
    return Array.from(functions).sort()
  }, [controls])

  // Extract unique owners for filter
  const owners = useMemo(() => {
    const ownerSet = new Set(controls.map((c) => c.owner))
    return Array.from(ownerSet).sort()
  }, [controls])

  // Filter controls based on search and filters
  const filteredControls = useMemo(() => {
    return controls.filter((control) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        control.controlDescription.toLowerCase().includes(searchLower) ||
        control.nistSubCategoryId.toLowerCase().includes(searchLower) ||
        control.identifiedRisks.toLowerCase().includes(searchLower)

      // Function filter
      const matchesFunction = functionFilter === "" || control.nistFunction === functionFilter

      // Priority filter
      const matchesPriority = priorityFilter === "" || control.assessmentPriority === priorityFilter

      // Status filter
      const matchesStatus = statusFilter === "" || control.remediationStatus === statusFilter

      // Compliance filter
      const matchesCompliance = complianceFilter === "" || control.meetsCriteria === complianceFilter

      // Owner filter
      const matchesOwner = ownerFilter === "" || control.owner === ownerFilter

      return matchesSearch && matchesFunction && matchesPriority && matchesStatus && matchesCompliance && matchesOwner
    })
  }, [controls, searchTerm, functionFilter, priorityFilter, statusFilter, complianceFilter, ownerFilter])

  const handleEditControl = (control: NistControl) => {
    setEditingControl({ ...control })
    setIsDialogOpen(true)
  }

  const handleSaveControl = async () => {
    if (!editingControl) return

    try {
      const result = await updateControl(editingControl)

      if (result) {
        toast({
          title: "Control Updated",
          description: "The control has been updated successfully.",
        })
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update the control.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating control:", err)
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the control.",
        variant: "destructive",
      })
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFunctionFilter("")
    setPriorityFilter("")
    setStatusFilter("")
    setComplianceFilter("")
    setOwnerFilter("")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Controls Explorer</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          </CardContent>
        </Card>
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Controls Explorer</h1>
        <RefreshButton />
      </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="owner-filter" className="text-xs mb-1 block">
                    Owner
                  </Label>
                  <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                    <SelectTrigger id="owner-filter">
                      <SelectValue placeholder="All Owners" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Owners</SelectItem>
                      {owners.map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="function-filter" className="text-xs mb-1 block">
                    NIST Function
                  </Label>
                  <Select value={functionFilter} onValueChange={setFunctionFilter}>
                    <SelectTrigger id="function-filter">
                      <SelectValue placeholder="All Functions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Functions</SelectItem>
                      {nistFunctions.map((func) => (
                        <SelectItem key={func} value={func}>
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority-filter" className="text-xs mb-1 block">
                    Priority
                  </Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger id="priority-filter">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status-filter" className="text-xs mb-1 block">
                    Remediation Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="compliance-filter" className="text-xs mb-1 block">
                    Compliance Status
                  </Label>
                  <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                    <SelectTrigger id="compliance-filter">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Yes">Compliant</SelectItem>
                      <SelectItem value="No">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredControls.length} of {controls.length} controls
              </div>

              {/* Controls Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner</TableHead>
                      <TableHead>Function</TableHead>
                      <TableHead>Sub-Category ID</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="hidden md:table-cell">Control Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredControls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No controls match the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredControls.map((control) => (
                        <TableRow key={control.id}>
                          <TableCell>{control.owner}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{control.nistFunction}</Badge>
                          </TableCell>
                          <TableCell>{control.nistSubCategoryId}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                control.assessmentPriority === "High"
                                  ? "destructive"
                                  : control.assessmentPriority === "Medium"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {control.assessmentPriority}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate">
                            {control.controlDescription}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                control.remediationStatus === "Completed"
                                  ? "success"
                                  : control.remediationStatus === "In Progress"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {control.remediationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={control.meetsCriteria === "Yes" ? "success" : "destructive"}>
                              {control.meetsCriteria}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleEditControl(control)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Control Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Control</DialogTitle>
            <DialogDescription>Update the control information and remediation status.</DialogDescription>
          </DialogHeader>

          {editingControl && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    value={editingControl.owner || ""}
                    onChange={(e) => setEditingControl({ ...editingControl, owner: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="nist-function">NIST Function</Label>
                  <Input
                    id="nist-function"
                    value={editingControl.nistFunction}
                    onChange={(e) => setEditingControl({ ...editingControl, nistFunction: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nist-category">NIST Category & ID</Label>
                  <Input
                    id="nist-category"
                    value={editingControl.nistCategoryId}
                    onChange={(e) => setEditingControl({ ...editingControl, nistCategoryId: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="nist-subcategory">NIST Sub-Category & ID</Label>
                  <Input
                    id="nist-subcategory"
                    value={editingControl.nistSubCategoryId}
                    onChange={(e) => setEditingControl({ ...editingControl, nistSubCategoryId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="assessment-priority">Assessment Priority</Label>
                  <Select
                    value={editingControl.assessmentPriority}
                    onValueChange={(value) =>
                      setEditingControl({ ...editingControl, assessmentPriority: value as "High" | "Medium" | "Low" })
                    }
                  >
                    <SelectTrigger id="assessment-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="cybersecurity-domain">Cybersecurity Domain</Label>
                  <Input
                    id="cybersecurity-domain"
                    value={editingControl.cybersecurityDomain}
                    onChange={(e) => setEditingControl({ ...editingControl, cybersecurityDomain: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="control-description">Control Description</Label>
                <Textarea
                  id="control-description"
                  value={editingControl.controlDescription}
                  onChange={(e) => setEditingControl({ ...editingControl, controlDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meets-criteria">Meets Criteria</Label>
                  <Select
                    value={editingControl.meetsCriteria}
                    onValueChange={(value) =>
                      setEditingControl({ ...editingControl, meetsCriteria: value as "Yes" | "No" })
                    }
                  >
                    <SelectTrigger id="meets-criteria">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="remediation-status">Remediation Status</Label>
                  <Select
                    value={editingControl.remediationStatus}
                    onValueChange={(value) =>
                      setEditingControl({
                        ...editingControl,
                        remediationStatus: value as "Not Started" | "In Progress" | "Completed",
                      })
                    }
                  >
                    <SelectTrigger id="remediation-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="identified-risks">Identified Risks</Label>
                <Textarea
                  id="identified-risks"
                  value={editingControl.identifiedRisks}
                  onChange={(e) => setEditingControl({ ...editingControl, identifiedRisks: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="risk-details">Risk Details</Label>
                <Textarea
                  id="risk-details"
                  value={editingControl.riskDetails}
                  onChange={(e) => setEditingControl({ ...editingControl, riskDetails: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveControl}>
              <Edit className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
