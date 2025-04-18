"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, LayoutDashboard, Settings, ShieldCheck, Upload, FileText, Building2, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function AppNavigation() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  const mainNavItems = [
    { name: "Introduction", href: "/introduction", icon: Home },
    { name: "Controls Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Owner Dashboard", href: "/owner-dashboard", icon: Building2 },
    { name: "Data Management", href: "/data-management", icon: Upload },
    { name: "Controls Explorer", href: "/controls", icon: ShieldCheck },
    { name: "Compliance Report", href: "/reports/compliance", icon: FileText },
  ]

  if (!isAuthenticated) {
    return null
  }

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <nav className="w-72 bg-black text-white overflow-y-auto border-r border-gray-800 flex flex-col h-full">
      {/* Main navigation items */}
      <div className="p-4 flex-grow">
        <ul className="space-y-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 rounded-md px-4 py-3 text-base font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-300 hover:bg-gray-900 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Settings and Logout at the bottom */}
      <div className="p-4 border-t border-gray-800">
        <ul className="space-y-3">
          <li>
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-4 rounded-md px-4 py-3 text-base font-medium transition-colors",
                isActive("/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-300 hover:bg-gray-900 hover:text-white",
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 rounded-md px-4 py-3 text-base font-medium transition-colors text-gray-300 hover:bg-gray-900 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
