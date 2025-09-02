"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"

function shortAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ""
}

export function WalletConnectButton() {
  const { address, isConnecting, isConnected, connect, disconnect } = useWallet()

  if (!isConnected) {
    return (
      <Button variant="default" size="sm" onClick={connect} disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground/80">{shortAddress(address!)}</span>
      <Button variant="outline" size="sm" onClick={disconnect}>
        Disconnect
      </Button>
    </div>
  )
}
