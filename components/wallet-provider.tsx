"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type WalletContextValue = {
  address: string | null
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // restore previous connection
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("connectedAddress") : null
    if (saved) setAddress(saved)
  }, [])

  useEffect(() => {
    const eth = (globalThis as any).ethereum
    if (!eth) return
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        localStorage.setItem("connectedAddress", accounts[0])
      } else {
        setAddress(null)
        localStorage.removeItem("connectedAddress")
      }
    }
    eth.on?.("accountsChanged", handleAccountsChanged)
    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged)
    }
  }, [])

  const connect = useCallback(async () => {
    const eth = (globalThis as any).ethereum
    if (!eth) {
      alert("No Ethereum provider found. Please install MetaMask.")
      return
    }
    setIsConnecting(true)
    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        localStorage.setItem("connectedAddress", accounts[0])
      }
    } catch (e) {
      console.error("[wallet] connect error", e)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    localStorage.removeItem("connectedAddress")
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      isConnecting,
      isConnected: !!address,
      connect,
      disconnect,
    }),
    [address, isConnecting, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
