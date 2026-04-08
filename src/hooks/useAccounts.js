import { useState, useCallback } from 'react'
import { INITIAL_ACCOUNTS } from '@/data/accounts'

/**
 * Manages social media account connection state.
 */
export function useAccounts() {
  const [accounts, setAccounts]   = useState(INITIAL_ACCOUNTS)
  const [connecting, setConnecting] = useState(null) // platform key being connected

  const connectedCount = Object.values(accounts).filter((a) => a.connected).length

  const connect = useCallback(async (platform) => {
    setConnecting(platform)
    // Simulate OAuth round-trip
    await new Promise((r) => setTimeout(r, 2000))
    setAccounts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        connected: true,
        username:  `@zynkpost_${platform.toLowerCase()}`,
        posts:     0,
        followers: '0',
      },
    }))
    setConnecting(null)
  }, [])

  const disconnect = useCallback((platform) => {
    setAccounts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        connected: false,
        username:  null,
        posts:     0,
        followers: null,
      },
    }))
  }, [])

  const toggle = useCallback((platform) => {
    if (accounts[platform].connected) {
      disconnect(platform)
    } else {
      connect(platform)
    }
  }, [accounts, connect, disconnect])

  return { accounts, connecting, connectedCount, toggle }
}
