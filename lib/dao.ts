export type ProposalStatus = "Open" | "Approved" | "Rejected" | "Executed"

export type Proposal = {
  id: string
  title: string
  description: string
  amount: number // ETH
  proposer: string
  createdAt: number
  votingEndsAt: number
  status: ProposalStatus
  votes: { yes: number; no: number }
  voters: Record<string, "yes" | "no">
}

const STORAGE_KEYS = {
  TREASURY: "dao_treasury_balance",
  PROPOSALS: "dao_proposals",
} as const

const VOTING_DURATION_MS = 3 * 60 * 1000 // 3 minutes for demo

function now() {
  return Date.now()
}

function readTreasury(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.TREASURY)
  if (!raw) {
    const initial = 1000 // 1000 ETH demo
    localStorage.setItem(STORAGE_KEYS.TREASURY, String(initial))
    return initial
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function writeTreasury(amount: number) {
  localStorage.setItem(STORAGE_KEYS.TREASURY, String(amount))
}

function readProposals(): Proposal[] {
  const raw = localStorage.getItem(STORAGE_KEYS.PROPOSALS)
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify([]))
    return []
  }
  try {
    const parsed = JSON.parse(raw) as Proposal[]
    return parsed.map(evaluateStatus)
  } catch {
    return []
  }
}

function writeProposals(list: Proposal[]) {
  localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(list))
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function evaluateStatus(p: Proposal): Proposal {
  if (p.status === "Executed") return p
  const current = now()
  if (current < p.votingEndsAt) {
    return { ...p, status: "Open" }
  }
  // voting ended
  if (p.votes.yes > p.votes.no) {
    return { ...p, status: "Approved" }
  }
  return { ...p, status: "Rejected" }
}

export const dao = {
  getTreasuryBalance(): number {
    return readTreasury()
  },

  listProposals(): Proposal[] {
    return readProposals()
      .map(evaluateStatus)
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  getProposal(id: string): Proposal | null {
    const p = readProposals().find((x) => x.id === id)
    return p ? evaluateStatus(p) : null
  },

  createProposal(input: { title: string; description: string; amount: number; proposer: string }) {
    const list = readProposals()
    const newP: Proposal = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description.trim(),
      amount: input.amount,
      proposer: input.proposer,
      createdAt: now(),
      votingEndsAt: now() + VOTING_DURATION_MS,
      status: "Open",
      votes: { yes: 0, no: 0 },
      voters: {},
    }
    list.push(newP)
    writeProposals(list)
    return newP
  },

  vote(input: { id: string; voter: string; support: boolean }): Proposal | null {
    const list = readProposals()
    const idx = list.findIndex((x) => x.id === input.id)
    if (idx === -1) return null
    const p = evaluateStatus(list[idx])
    // only during open period
    if (p.status !== "Open") return p
    // only one vote per voter
    if (p.voters[input.voter]) return p
    if (input.support) p.votes.yes += 1
    else p.votes.no += 1
    p.voters[input.voter] = input.support ? "yes" : "no"
    list[idx] = p
    writeProposals(list)
    return p
  },

  execute(id: string): Proposal | null {
    const list = readProposals()
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) return null
    let p = evaluateStatus(list[idx])
    if (p.status !== "Approved") return p
    // ensure voting period over
    if (now() < p.votingEndsAt) return p
    // ensure treasury has funds
    const treasury = readTreasury()
    if (treasury >= p.amount) {
      writeTreasury(treasury - p.amount)
      p = { ...p, status: "Executed" }
      list[idx] = p
      writeProposals(list)
      return p
    }
    // insufficient funds -> keep Approved state, no change
    return p
  },
}
