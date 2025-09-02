"use client"

import type React from "react"
import { WalletProvider } from "./wallet-provider"
import { Nav } from "./nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-dvh flex flex-col">
        <Nav />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      </div>
    </WalletProvider>
  )
}
