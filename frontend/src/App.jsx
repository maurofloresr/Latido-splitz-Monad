import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './hooks/useWallet'
import { useContract } from './hooks/useContract'
import LandingPage from './components/LandingPage'
import RoleSelect from './components/RoleSelect'
import GuardianDashboard from './components/GuardianDashboard'
import DependentView from './components/DependentView'
import { CONTRACT_ADDRESS, LATIDO_ABI } from './utils/contract'
import './App.css'

export default function App() {
  const { address, provider, signer, error, connecting, connect, disconnect } = useWallet()
  const contract = useContract(signer, provider)
  const [role, setRole] = useState(null)
  const [guardianAddress, setGuardianAddress] = useState(null)
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    if (!address) { setRole(null); return }
    setDetecting(true)
    ;(async () => {
      try {
        const r = await contract.detectRole(address)
        if (r === 'dependent') {
          const g = await contract.getGuardianOf(address)
          setGuardianAddress(g)
        }
        setRole(r)
      } catch {
        setRole('new')
      } finally {
        setDetecting(false)
      }
    })()
  }, [address])

  const handleDisconnect = () => {
    disconnect()
    setRole(null)
    setGuardianAddress(null)
  }

  if (!address) return <LandingPage onConnect={connect} connecting={connecting} error={error} />

  if (detecting) return (
    <div className="loading-screen">
      <img src="/images/logo.png" alt="Latido" className="landing-logo" />
      <div className="spinner-lg" />
      <p>Verificando tu cuenta...</p>
    </div>
  )

  if (role === 'new') return (
    <RoleSelect address={address} onSelect={setRole} onDisconnect={handleDisconnect} />
  )

  if (role === 'dependent') return (
    <DependentView
      address={address}
      guardianAddress={guardianAddress}
      contract={contract}
      onDisconnect={handleDisconnect}
    />
  )

  return (
    <GuardianDashboard
      address={address}
      contract={contract}
      onDisconnect={handleDisconnect}
    />
  )
}
