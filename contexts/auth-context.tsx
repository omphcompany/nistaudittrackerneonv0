"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check both sessionStorage and cookies
      const sessionAuth = sessionStorage.getItem("isAuthenticated") === "true"
      const cookieAuth = document.cookie.includes("auth=true")

      console.log("Auth check - Session:", sessionAuth, "Cookie:", cookieAuth)

      const isAuth = sessionAuth || cookieAuth
      setIsAuthenticated(isAuth)
      return isAuth
    }

    checkAuthStatus()

    // Set up an interval to periodically check auth status
    const interval = setInterval(checkAuthStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Function to check authentication status
  const checkAuth = () => {
    const sessionAuth = sessionStorage.getItem("isAuthenticated") === "true"
    const cookieAuth = document.cookie.includes("auth=true") || document.cookie.includes("nistauth=true")

    console.log("Auth check - Session:", sessionAuth, "Cookie:", cookieAuth, "Cookie string:", document.cookie)

    return sessionAuth || cookieAuth
  }

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    // Hardcoded credentials
    const validUsername = "nistauditor"
    const validPassword = "NISTAuditor$"

    if (username === validUsername && password === validPassword) {
      // Set both sessionStorage and cookie
      sessionStorage.setItem("isAuthenticated", "true")
      setIsAuthenticated(true)

      // Set a cookie for server-side auth checks with secure flags
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 1) // 24 hours

      // Use a more robust cookie setting approach
      document.cookie = `auth=true; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`

      // Add a second cookie with a different name as a fallback
      document.cookie = `nistauth=true; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`

      console.log("Login successful - Auth cookies set:", document.cookie)
      return true
    }

    return false
  }

  // Logout function
  const logout = () => {
    sessionStorage.removeItem("isAuthenticated")
    setIsAuthenticated(false)

    // Clear the auth cookie
    document.cookie = "auth=; path=/; max-age=0; SameSite=Strict"

    console.log("Logout - Auth cookie cleared")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
