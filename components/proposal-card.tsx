"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Proposal } from "@/lib/dao"
import { formatEther, statusColor } from "@/lib/format"

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base text-balance">{proposal.title}</CardTitle>
          <Badge className={statusColor(proposal.status)}>{proposal.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-foreground/80">
        <p className="mb-2 text-pretty">{proposal.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-foreground/60">Requested</div>
            <div className="font-medium">{formatEther(proposal.amount)} ETH</div>
          </div>
          <div>
            <div className="text-xs text-foreground/60">Proposer</div>
            <div className="font-medium break-all">{proposal.proposer}</div>
          </div>
          <div>
            <div className="text-xs text-foreground/60">Yes Votes</div>
            <div className="font-medium">{proposal.votes.yes}</div>
          </div>
          <div>
            <div className="text-xs text-foreground/60">No Votes</div>
            <div className="font-medium">{proposal.votes.no}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild size="sm">
          <Link href={`/proposals/${proposal.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
