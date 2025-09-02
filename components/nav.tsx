"use client"

import Link from "next/link"
import { WalletConnectButton } from "./wallet-connect-button"

export function Nav() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-foreground">
          DAO Treasury
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-foreground/80 hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/proposals/new" className="text-sm text-foreground/80 hover:text-foreground">
            Create Proposal
          </Link>
          <Link href="/my" className="text-sm text-foreground/80 hover:text-foreground">
            My Proposals
          </Link>
          <WalletConnectButton />
        </nav>
      </div>
    </header>
  )
}
