"use client"

import { AppShell } from "@/components/app-shell"
import { useWallet } from "@/components/wallet-provider"
import { useProposals } from "@/hooks/use-dao"
import { ProposalCard } from "@/components/proposal-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MyProposalsPage() {
  const { isConnected, address, connect } = useWallet()
  const { proposals } = useProposals()
  const mine = proposals.filter((p) => p.proposer.toLowerCase() === (address ?? "").toLowerCase())

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">My Proposals</h1>
          <Button asChild size="sm">
            <Link href="/proposals/new">New Proposal</Link>
          </Button>
        </div>

        {!isConnected ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-foreground/70">Connect your wallet to view proposals you created.</p>
                <Button onClick={connect}>Connect Wallet</Button>
              </div>
            </CardContent>
          </Card>
        ) : mine.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-foreground/60">You haven’t created any proposals yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mine.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
