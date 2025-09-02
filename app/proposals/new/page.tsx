"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { dao } from "@/lib/dao"
import { useWallet } from "@/components/wallet-provider"
import { refreshAll } from "@/hooks/use-dao"

export default function CreateProposalPage() {
  const router = useRouter()
  const { address, isConnected, connect } = useWallet()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = title.trim() && description.trim() && Number(amount) > 0 && isConnected

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isConnected) return connect()
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const p = dao.createProposal({
        title,
        description,
        amount: Number(amount),
        proposer: address!,
      })
      await refreshAll(p.id)
      router.push(`/proposals/${p.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Create Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected && (
              <div className="mb-4 text-sm text-foreground/70">Connect your wallet to submit a proposal.</div>
            )}
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Short summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this proposal about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Requested Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.0001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Proposal"}
                </Button>
                {!isConnected && (
                  <Button type="button" variant="outline" onClick={connect}>
                    Connect Wallet
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
