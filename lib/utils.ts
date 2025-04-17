import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateCompliancePercentage(compliant: number, total: number): number {
  if (total === 0) return 0
  return Math.round((compliant / total) * 100)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Completed":
      return "bg-green-500"
    case "In Progress":
      return "bg-amber-500"
    case "Not Started":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "High":
      return "bg-red-500"
    case "Medium":
      return "bg-amber-500"
    case "Low":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

export function getFunctionColor(func: string): string {
  const colors: Record<string, string> = {
    GV: "bg-purple-500",
    ID: "bg-blue-500",
    PR: "bg-green-500",
    DE: "bg-amber-500",
    RS: "bg-red-500",
    RC: "bg-indigo-500",
  }

  return colors[func] || "bg-gray-500"
}
