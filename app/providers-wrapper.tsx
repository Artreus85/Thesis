"use client"

import type React from "react"

import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Toaster />
    </Providers>
  )
}
