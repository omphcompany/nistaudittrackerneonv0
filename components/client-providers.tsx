"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { DataProvider } from "@/contexts/data-context"
import { AuthProvider } from "@/contexts/auth-context"

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </DataProvider>
    </AuthProvider>
  )
}
