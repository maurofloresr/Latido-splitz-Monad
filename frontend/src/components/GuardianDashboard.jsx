import { useState, useEffect, useCallback } from 'react'
import { getDisplayName, saveAlias } from '../utils/aliases'
import { fromUSDT } from '../utils/contract'
import { formatDate, shortAddress } from '../utils/format'

export default function GuardianDashboard({ address, contract, onDisconnect }) {
  const [myBalance, setMyBalance] = useState('...')
  const [dependents, setDependents] = useState([])
  const [balances, setBalances] = useState({})
  const [histories, setHistories] = useState({})
  const [requests, setRequests] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [modal, setModal] = useState(null) // null | 'add' | { type:'fund', dep }
  const [refresh, setRefresh] = useState(0)

  const reload = () => setRefresh(r => r + 1)

  const loadData = useCallback(async () => {
    const [myBal, deps, reqs] = await Promise.all([
      contract.getMyBalance(address),
      contract.getDependents(address),
      contract.getPendingRequests(address),
    ])
    setMyBalance(myBal)
    setDependents(deps)
    setRequests(reqs)

    const bals = {}
    await Promise.all(deps.map(async d => {
      bals[d] = await contract.getBalance(d)
    }))
    setBalances(bals)
  }, [address, contract, refresh])

  useEffect(() => { loadData() }, [loadData])

  const totalInAccounts = Object.values(balances)
    .reduce((s, b) => s + parseFloat(b || 0), 0).toFixed(2)

  const toggleExpand = async (dep) => {
    if (expanded === dep) { setExpanded(null); return }
    setExpanded(dep)
    if (!histories[dep]) {
      const hist = await contract.getPaymentHistory(dep)
      setHistories(p => ({ ...p, [dep]: [...hist].reverse() }))
    }
  }

  const handleAdd = async (wallet, name) => {
    const ok = await contract.addDependent(wallet)
    if (ok) { saveAlias(wallet, name); setModal(null); reload() }
  }

  const handleFund = async (dep, amount) => {
    const ok = await contract.fundDependent(dep, amount)
    if (ok) { setModal(null); reload() }
  }

  const handleRemoveFunds = async (dep, amount) => {
    const ok = await contract.removeFunds(dep, amount)
    if (ok) { setModal(null); reload() }
  }

  const handleRemoveDep = async (dep) => {
    if (!confirm(`¿Eliminar a ${getDisplayName(dep)}?`)) return
    await contract.removeDependent(dep)
    reload()
  }

  const handleApprove = async (id) => {
    await contract.approveRequest(id)
    reload()
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <img src="/images/logo.png" alt="Latido" className="header-logo" />
        <div className="header-right">
          <span className="addr-pill">{shortAddress(address)}</span>
          <button className="btn-ghost" onClick={onDisconnect}>Salir</button>
        </div>
      </header>

      {/* Stats — 4 cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Mi saldo</span>
          <span className="stat-value">{myBalance} <small>USDT</small></span>
        </div>
        <div className="stat-card accent">
          <span className="stat-label">Saldo en cuentas</span>
          <span className="stat-value">{totalInAccounts} <small>USDT</small></span>
        </div>
        <div className="stat-card blue">
          <span className="stat-label">Cuentas activas</span>
          <span className="stat-value">{dependents.length}</span>
        </div>
        <div className="stat-card warn">
          <span className="stat-label">Pedidos pendientes</span>
          <span className="stat-value">{requests.length}</span>
        </div>
      </div>

      {/* Requests */}
      {requests.length > 0 && (
        <section className="section">
          <h3 className="section-title">📬 Pedidos pendientes</h3>
          {requests.map(req => (
            <div key={req.id} className="req-card">
              <div className="req-info">
                <span className="req-name">{getDisplayName(req.dependent)}</span>
                <span className="req-amount">{fromUSDT(req.amount)} USDT</span>
                <span className="req-reason">"{req.reason}"</span>
              </div>
              <button className="btn-approve" onClick={() => handleApprove(req.id)} disabled={contract.loading}>
                Aprobar
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Accounts */}
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Cuentas</h3>
          <button className="btn-add" onClick={() => setModal('add')}>+ Añadir</button>
        </div>

        {dependents.length === 0 && (
          <div className="empty-state">
            <p>No tenés cuentas todavía.</p>
            <button className="btn-primary" onClick={() => setModal('add')}>Agregar primera cuenta</button>
          </div>
        )}

        {dependents.map(dep => (
          <div key={dep} className="account-card">
            <div className="account-header" onClick={() => toggleExpand(dep)}>
              <div className="account-left">
                <div className="avatar">{getDisplayName(dep).charAt(0).toUpperCase()}</div>
                <div>
                  <span className="account-name">{getDisplayName(dep)}</span>
                  <span className="account-addr">{shortAddress(dep)}</span>
                </div>
              </div>
              <div className="account-right">
                <span className="account-balance">{balances[dep] || '...'} USDT</span>
                <span className={`chevron ${expanded === dep ? 'open' : ''}`}>▾</span>
              </div>
            </div>

            {expanded === dep && (
              <div className="account-detail">
                <div className="account-actions">
                  <button className="btn-secondary" onClick={() => setModal({ type: 'fund', dep })}>
                    Depositar / Retirar
                  </button>
                  <button className="btn-danger" onClick={() => handleRemoveDep(dep)}>
                    🗑 Eliminar
                  </button>
                </div>
                <p className="hist-title">Historial de gastos</p>
                {!histories[dep] && <p className="muted">Cargando...</p>}
                {histories[dep]?.length === 0 && <p className="muted">Sin movimientos aún.</p>}
                {histories[dep]?.slice(0, 5).map((p, i) => (
                  <div key={i} className="hist-row">
                    <span className="hist-amount">{fromUSDT(p.amount)} USDT</span>
                    <span className="hist-desc">{p.description}</span>
                    <span className="hist-date">{formatDate(p.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Modals */}
      {modal === 'add' && (
        <AddModal onAdd={handleAdd} onClose={() => setModal(null)} loading={contract.loading} />
      )}
      {modal?.type === 'fund' && (
        <FundModal
          name={getDisplayName(modal.dep)}
          dep={modal.dep}
          onFund={handleFund}
          onRemove={handleRemoveFunds}
          onClose={() => setModal(null)}
          loading={contract.loading}
        />
      )}

      {contract.txError && (
        <div className="toast" onClick={() => contract.setTxError(null)}>
          ⚠️ {contract.txError}
        </div>
      )}
    </div>
  )
}

function AddModal({ onAdd, onClose, loading }) {
  const [wallet, setWallet] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    if (!wallet.startsWith('0x') || wallet.length !== 42) { setErr('Wallet inválida'); return }
    if (!name.trim()) { setErr('Ingresá un nombre'); return }
    onAdd(wallet.trim(), name.trim())
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Agregar cuenta</h2>
        <div className="field">
          <label>Wallet</label>
          <input className="input" placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} />
        </div>
        <div className="field">
          <label>Nombre</label>
          <input className="input" placeholder="Ej: Abuela Lola" value={name} onChange={e => setName(e.target.value)} />
        </div>
        {err && <p className="field-error">{err}</p>}
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? 'Agregando...' : 'Añadir'}
        </button>
      </div>
    </div>
  )
}

function FundModal({ name, dep, onFund, onRemove, onClose, loading }) {
  const [mode, setMode] = useState('fund')
  const [amount, setAmount] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    if (!parseFloat(amount) || parseFloat(amount) <= 0) { setErr('Monto inválido'); return }
    if (mode === 'fund') onFund(dep, amount)
    else onRemove(dep, amount)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">{name}</h2>
        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'fund' ? 'active' : ''}`} onClick={() => setMode('fund')}>Depositar</button>
          <button className={`mode-btn ${mode === 'remove' ? 'active' : ''}`} onClick={() => setMode('remove')}>Retirar</button>
        </div>
        <div className="field">
          <label>Monto (USDT)</label>
          <input className="input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />
        </div>
        {mode === 'fund' && <p className="field-hint">Se pedirá approve() en USDT primero.</p>}
        {err && <p className="field-error">{err}</p>}
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? 'Procesando...' : mode === 'fund' ? 'Depositar' : 'Retirar'}
        </button>
      </div>
    </div>
  )
}
