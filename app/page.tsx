"use client"

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProposals, useTreasury } from "@/hooks/use-dao"
import { ProposalCard } from "@/components/proposal-card"
import { formatEther } from "@/lib/format"

export default function DashboardPage() {
  const { balance } = useTreasury()
  const { proposals } = useProposals()

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-balance">Treasury Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{formatEther(balance)} ETH</div>
              <p className="text-sm text-foreground/60 mt-1">Total available funds</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-balance">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/proposals/new">Create Proposal</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/my">My Proposals</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proposals</h2>
          <Button asChild size="sm">
            <Link href="/proposals/new">New Proposal</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-foreground/60">No proposals yet. Create the first one.</p>
              </CardContent>
            </Card>
          ) : (
            proposals.map((p) => <ProposalCard key={p.id} proposal={p} />)
          )}
        </div>
      </div>
    </AppShell>
  )
}
