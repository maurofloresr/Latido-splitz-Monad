import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { MONAD_NETWORK } from '../utils/contract'

export function useWallet() {
  const [address, setAddress] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Necesitás MetaMask instalado.')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_NETWORK.chainId }],
        })
      } catch (e) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          })
        } else throw e
      }
      const p = new ethers.BrowserProvider(window.ethereum)
      const accounts = await p.send('eth_requestAccounts', [])
      const s = await p.getSigner()
      setProvider(p)
      setSigner(s)
      setAddress(accounts[0])
    } catch (e) {
      setError(e.message || 'Error al conectar')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
  }, [])

  return { address, provider, signer, error, connecting, connect, disconnect }
}
