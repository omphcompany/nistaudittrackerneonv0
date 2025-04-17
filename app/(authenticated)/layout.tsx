import type React from "react"
import TopBanner from "@/components/top-banner"
import { AppNavigation } from "@/components/app-navigation"
import { DbInitializer } from "@/components/db-initializer"

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Panel - Banner (Full Width) */}
      <TopBanner />

      {/* Main Content Area - Navigation and Content side by side */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Navigation (always dark) */}
        <AppNavigation />

        {/* Right Panel - Content (theme applies here) */}
        <div className="flex-1 overflow-y-auto bg-background text-foreground">
          <DbInitializer />
          {children}
        </div>
      </div>
    </div>
  )
}
