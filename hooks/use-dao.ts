"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { dao, type Proposal } from "@/lib/dao"

const fetchers = {
  treasury: async () => dao.getTreasuryBalance(),
  proposals: async () => dao.listProposals(),
  proposal: async (id: string) => dao.getProposal(id),
}

export function useTreasury() {
  const { data, isLoading, mutate, error } = useSWR("treasury", fetchers.treasury, { revalidateOnFocus: false })
  return { balance: data ?? 0, isLoading, mutate, error }
}

export function useProposals() {
  const { data, isLoading, mutate, error } = useSWR<Proposal[]>("proposals", fetchers.proposals, {
    revalidateOnFocus: false,
  })
  return { proposals: data ?? [], isLoading, mutate, error }
}

export function useProposal(id: string) {
  const { data, isLoading, mutate, error } = useSWR(["proposal", id], () => fetchers.proposal(id), {
    revalidateOnFocus: false,
  })
  return { proposal: data ?? null, isLoading, mutate, error }
}

// helpers to refresh caches after writes
export async function refreshAll(id?: string) {
  await Promise.all([
    globalMutate("treasury"),
    globalMutate("proposals"),
    id ? globalMutate(["proposal", id]) : Promise.resolve(),
  ])
}
