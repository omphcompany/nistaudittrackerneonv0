"use client"

import type { Toast } from "@/lib/toast"
import * as React from "react"

const UPDATE_DELAY = 200

type Action = {
  children: React.ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: Action
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  type?: "default" | "destructive"
  promise?: Promise<any>
  className?: string
}

const toasts: Toast[] = []

type ToasterApi = {
  /**
   * Hook to subscribe to toast updates.
   */
  useToast: () => {
    toasts: Toast[]
    toast: (props: ToastProps) => string
    dismiss: (toastId?: string) => void
    remove: (toastId: string) => void
    update: (toastId: string, props: Partial<ToastProps>) => void
  }
}

const context = React.createContext<ToasterApi>({
  useToast() {
    return {
      toasts,
      toast: () => {
        console.warn("useToast: `toast` function unavailable outside of ToasterContext")
        return ""
      },
      dismiss: () => console.warn("useToast: `dismiss` function unavailable outside of ToasterContext"),
      remove: () => console.warn("useToast: `remove` function unavailable outside of ToasterContext"),
      update: () => console.warn("useToast: `update` function unavailable outside of ToasterContext"),
    }
  },
})

export const useToast = () => {
  return React.useContext(context).useToast()
}
