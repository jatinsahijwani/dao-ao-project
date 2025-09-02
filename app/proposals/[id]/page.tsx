"use client"

import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProposal, refreshAll, useTreasury } from "@/hooks/use-dao"
import { dao } from "@/lib/dao"
import { useWallet } from "@/components/wallet-provider"
import { formatEther, statusColor } from "@/lib/format"
import { useMemo } from "react"

function remainingMs(end: number) {
  const diff = end - Date.now()
  return Math.max(0, diff)
}
function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m > 0) return `${m}m ${r}s`
  return `${r}s`
}

export default function ProposalDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const { proposal, isLoading } = useProposal(id)
  const { balance } = useTreasury()
  const { address, isConnected, connect } = useWallet()

  const canVote = useMemo(() => {
    if (!proposal) return false
    if (!isConnected) return false
    if (proposal.status !== "Open") return false
    if (proposal.voters[address as string]) return false
    return true
  }, [proposal, isConnected, address])

  const canExecute = useMemo(() => {
    if (!proposal) return false
    return proposal.status === "Approved" && Date.now() >= proposal.votingEndsAt && proposal.amount <= balance
  }, [proposal, balance])

  async function handleVote(support: boolean) {
    if (!isConnected) return connect()
    if (!proposal) return
    dao.vote({ id, voter: address!, support })
    await refreshAll(id)
  }

  async function handleExecute() {
    if (!proposal) return
    dao.execute(id)
    await refreshAll(id)
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-sm text-foreground/60">Loading...</div>
      </AppShell>
    )
  }

  if (!proposal) {
    return (
      <AppShell>
        <div className="text-sm text-foreground/60">Proposal not found.</div>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-balance">{proposal.title}</CardTitle>
              <Badge className={statusColor(proposal.status)}>{proposal.status}</Badge>
            </div>
            <div className="text-xs text-foreground/60">
              Proposer: <span className="font-mono break-all">{proposal.proposer}</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="text-xs text-foreground/60">Description</div>
              <p className="text-sm text-pretty">{proposal.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-foreground/60">Requested</div>
                <div className="font-medium">{formatEther(proposal.amount)} ETH</div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">Treasury Balance</div>
                <div className="font-medium">{formatEther(balance)} ETH</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-4">
                <div className="text-xs text-foreground/60">Yes Votes</div>
                <div className="text-2xl font-semibold">{proposal.votes.yes}</div>
              </div>
              <div className="rounded-md border p-4">
                <div className="text-xs text-foreground/60">No Votes</div>
                <div className="text-2xl font-semibold">{proposal.votes.no}</div>
              </div>
            </div>

            {proposal.status === "Open" && (
              <div className="text-sm text-foreground/70">
                Voting ends in {formatDuration(remainingMs(proposal.votingEndsAt))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {proposal.status === "Open" && (
                <>
                  <Button onClick={() => handleVote(true)} disabled={!canVote}>
                    {isConnected ? "Vote Yes" : "Connect to Vote"}
                  </Button>
                  <Button variant="destructive" onClick={() => handleVote(false)} disabled={!canVote}>
                    {isConnected ? "Vote No" : "Connect to Vote"}
                  </Button>
                </>
              )}
              {canExecute && (
                <Button variant="secondary" onClick={handleExecute}>
                  Execute (Release Funds)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
