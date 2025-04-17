"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if the user is authenticated on initial load
  useEffect(() => {
    try {
      const authStatus = sessionStorage.getItem("isAuthenticated") === "true"
      setIsAuthenticated(authStatus)
    } catch (error) {
      console.error("Error accessing sessionStorage:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    // Hardcoded credentials
    const validUsername = "nistauditor"
    const validPassword = "NISTAuditor$"

    if (username === validUsername && password === validPassword) {
      try {
        sessionStorage.setItem("isAuthenticated", "true")
        setIsAuthenticated(true)

        // Set a cookie for server-side auth checks
        document.cookie = "auth=true; path=/; max-age=86400" // 24 hours
      } catch (error) {
        console.error("Error setting authentication:", error)
        return false
      }

      return true
    }

    return false
  }

  // Logout function
  const logout = () => {
    try {
      sessionStorage.removeItem("isAuthenticated")
      setIsAuthenticated(false)

      // Clear the auth cookie
      document.cookie = "auth=; path=/; max-age=0"
    } catch (error) {
      console.error("Error during logout:", error)
    }

    router.push("/login")
  }

  // Only render children when the auth state is initialized
  if (!isInitialized) {
    return null // Or a loading spinner
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
