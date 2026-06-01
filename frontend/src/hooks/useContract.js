import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import {
  CONTRACT_ADDRESS, USDT_ADDRESS,
  LATIDO_ABI, USDT_ABI,
  toUSDT, fromUSDT
} from '../utils/contract'

export function useContract(signer, provider) {
  const [loading, setLoading] = useState(false)
  const [txError, setTxError] = useState(null)

  const latidoRead = useCallback(() =>
    provider ? new ethers.Contract(CONTRACT_ADDRESS, LATIDO_ABI, provider) : null
  , [provider])

  const latidoWrite = useCallback(() =>
    signer ? new ethers.Contract(CONTRACT_ADDRESS, LATIDO_ABI, signer) : null
  , [signer])

  const usdtWrite = useCallback(() =>
    signer ? new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer) : null
  , [signer])

  const usdtRead = useCallback(() =>
    provider ? new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider) : null
  , [provider])

  const run = async (fn) => {
    setLoading(true)
    setTxError(null)
    try {
      const result = await fn()
      return result
    } catch (e) {
      const msg = e.reason || e.shortMessage || e.message || 'Error desconocido'
      setTxError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Detectar rol de la wallet
  const detectRole = useCallback(async (address) => {
    try {
      const c = latidoRead()
      if (!c) return 'new'
      const guardian = await c.guardianOf(address)
      if (guardian !== ethers.ZeroAddress) return 'dependent'
      const deps = await c.getDependents(address)
      if (deps.length > 0) return 'guardian'
      return 'new'
    } catch { return 'new' }
  }, [latidoRead])

  // Saldo personal USDT del guardian en su wallet
  const getMyBalance = useCallback(async (address) => {
    try {
      const c = usdtRead()
      if (!c) return '0.00'
      const bal = await c.balanceOf(address)
      return fromUSDT(bal)
    } catch { return '0.00' }
  }, [usdtRead])

  // Saldo de un dependiente dentro del contrato
  const getBalance = useCallback(async (address) => {
    try {
      const c = latidoRead()
      if (!c) return '0.00'
      const bal = await c.availableBalance(address)
      return fromUSDT(bal)
    } catch { return '0.00' }
  }, [latidoRead])

  const getPaymentHistory = useCallback(async (address) => {
    try {
      const c = latidoRead()
      if (!c) return []
      return await c.getPaymentHistory(address)
    } catch { return [] }
  }, [latidoRead])

  const getDependents = useCallback(async (address) => {
    try {
      const c = latidoRead()
      if (!c) return []
      return await c.getDependents(address)
    } catch { return [] }
  }, [latidoRead])

  const getGuardianOf = useCallback(async (address) => {
    try {
      const c = latidoRead()
      if (!c) return null
      const g = await c.guardianOf(address)
      return g === ethers.ZeroAddress ? null : g
    } catch { return null }
  }, [latidoRead])

  const getPendingRequests = useCallback(async (guardianAddress) => {
    try {
      const c = latidoRead()
      if (!c) return []
      const ids = await c.getPendingRequests(guardianAddress)
      const reqs = []
      for (const id of ids) {
        const req = await c.requests(id)
        if (req.pending) reqs.push({ id: Number(id), dependent: req.dependent, amount: req.amount, reason: req.reason })
      }
      return reqs
    } catch { return [] }
  }, [latidoRead])

  // Escritura
  const addDependent = useCallback(async (dep) =>
    run(async () => {
      const tx = await latidoWrite().addDependent(dep)
      await tx.wait()
      return true
    })
  , [signer])

  const fundDependent = useCallback(async (dep, amountStr) =>
    run(async () => {
      const amount = toUSDT(amountStr)
      const approveTx = await usdtWrite().approve(CONTRACT_ADDRESS, amount)
      await approveTx.wait()
      const tx = await latidoWrite().fundDependent(dep, amount)
      await tx.wait()
      return true
    })
  , [signer])

  const removeFunds = useCallback(async (dep, amountStr) =>
    run(async () => {
      const tx = await latidoWrite().removeFunds(dep, toUSDT(amountStr))
      await tx.wait()
      return true
    })
  , [signer])

  const removeDependent = useCallback(async (dep) =>
    run(async () => {
      const tx = await latidoWrite().removeDependent(dep)
      await tx.wait()
      return true
    })
  , [signer])

  const approveRequest = useCallback(async (id) =>
    run(async () => {
      const tx = await latidoWrite().approveRequest(id)
      await tx.wait()
      return true
    })
  , [signer])

  const spend = useCallback(async (amountStr, description) =>
    run(async () => {
      const tx = await latidoWrite().spend(toUSDT(amountStr), description)
      await tx.wait()
      return true
    })
  , [signer])

  const requestMore = useCallback(async (amountStr, reason) =>
    run(async () => {
      const tx = await latidoWrite().requestMore(toUSDT(amountStr), reason)
      await tx.wait()
      return true
    })
  , [signer])

  return {
    loading, txError, setTxError,
    detectRole,
    getMyBalance, getBalance, getPaymentHistory,
    getDependents, getGuardianOf, getPendingRequests,
    addDependent, fundDependent, removeFunds, removeDependent,
    approveRequest, spend, requestMore,
  }
}
