import type { ProposalStatus } from "./dao"

export function formatEther(amount: number) {
  // Treat amount as ETH already (no wei math for simplicity)
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export function statusColor(status: ProposalStatus) {
  switch (status) {
    case "Open":
      return "bg-blue-600 text-white"
    case "Approved":
      return "bg-green-600 text-white"
    case "Rejected":
      return "bg-red-600 text-white"
    case "Executed":
      return "bg-gray-700 text-white"
    default:
      return "bg-muted text-foreground"
  }
}
