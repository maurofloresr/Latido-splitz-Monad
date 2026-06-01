import { useState, useEffect, useCallback } from 'react'
import { getDisplayName } from '../utils/aliases'
import { fromUSDT } from '../utils/contract'
import { formatDate, shortAddress } from '../utils/format'

export default function DependentView({ address, guardianAddress, contract, onDisconnect }) {
  const [balance, setBalance] = useState('...')
  const [history, setHistory] = useState([])
  const [modal, setModal] = useState(null) // null | 'pay' | 'request'
  const [refresh, setRefresh] = useState(0)

  const reload = () => setRefresh(r => r + 1)

  const loadData = useCallback(async () => {
    const [bal, hist] = await Promise.all([
      contract.getBalance(address),
      contract.getPaymentHistory(address),
    ])
    setBalance(bal)
    setHistory([...hist].reverse())
  }, [address, contract, refresh])

  useEffect(() => { loadData() }, [loadData])

  const handlePay = async (amount, desc) => {
    const ok = await contract.spend(amount, desc)
    if (ok) { setModal(null); reload() }
  }

  const handleRequest = async (amount, reason) => {
    const ok = await contract.requestMore(amount, reason)
    if (ok) { setModal(null); reload() }
  }

  return (
    <div className="dep-view">
      <header className="dash-header">
        <img src="/images/logo.png" alt="Latido" className="header-logo" />
        <div className="header-right">
          <span className="addr-pill">{shortAddress(address)}</span>
          <button className="btn-ghost" onClick={onDisconnect}>Salir</button>
        </div>
      </header>

      <div className="dep-content">
        <div className="balance-card">
          <p className="balance-label">Tu saldo disponible</p>
          <h1 className="balance-amount">{balance} <span className="balance-unit">USDT</span></h1>
          {guardianAddress && (
            <p className="guardian-info">
              Guardian: <strong>{getDisplayName(guardianAddress) || shortAddress(guardianAddress)}</strong>
            </p>
          )}
        </div>

        {/* Tarjeta 3D */}
        <div className="dep-card" onClick={() => setModal('pay')}>
          <img src="/images/tarjeta.png" alt="Latido Card" className="dep-card-img" />
          <div className="dep-card-label">Tocá para anotar un gasto</div>
        </div>

        <button className="btn-request" onClick={() => setModal('request')}>
          Pedir más dinero
        </button>

        <div className="dep-history">
          <p className="hist-title">Últimos movimientos</p>
          {history.length === 0 && <p className="muted">Sin movimientos aún.</p>}
          {history.slice(0, 10).map((p, i) => (
            <div key={i} className="hist-row">
              <span className="hist-amount">-{fromUSDT(p.amount)} USDT</span>
              <span className="hist-desc">{p.description}</span>
              <span className="hist-date">{formatDate(p.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {modal === 'pay' && (
        <PayModal balance={balance} onPay={handlePay} onClose={() => setModal(null)} loading={contract.loading} />
      )}
      {modal === 'request' && (
        <RequestModal onRequest={handleRequest} onClose={() => setModal(null)} loading={contract.loading} />
      )}

      {contract.txError && (
        <div className="toast" onClick={() => contract.setTxError(null)}>⚠️ {contract.txError}</div>
      )}
    </div>
  )
}

function PayModal({ balance, onPay, onClose, loading }) {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    const v = parseFloat(amount)
    if (!v || v <= 0) { setErr('Ingresá un monto válido'); return }
    if (v > parseFloat(balance)) { setErr('No tenés suficiente saldo'); return }
    if (!desc.trim()) { setErr('Escribí en qué lo gastaste'); return }
    onPay(amount, desc.trim())
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-bottom" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Anotar gasto</h2>
        <p className="field-hint">Saldo disponible: <strong>{balance} USDT</strong></p>
        <div className="field">
          <label>Total (USDT)</label>
          <input className="input input-big" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" autoFocus />
        </div>
        <div className="field">
          <label>Descripción</label>
          <input className="input" placeholder="Ej: Supermercado DIA" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        {err && <p className="field-error">{err}</p>}
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? 'Procesando...' : 'PAGAR'}
        </button>
      </div>
    </div>
  )
}

function RequestModal({ onRequest, onClose, loading }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    if (!parseFloat(amount) || parseFloat(amount) <= 0) { setErr('Ingresá un monto'); return }
    if (!reason.trim()) { setErr('Escribí el motivo'); return }
    onRequest(amount, reason.trim())
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-bottom" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Pedir más dinero</h2>
        <div className="field">
          <label>Cantidad (USDT)</label>
          <input className="input input-big" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" autoFocus />
        </div>
        <div className="field">
          <label>Motivo</label>
          <input className="input" placeholder="Ej: Gastos médicos" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        {err && <p className="field-error">{err}</p>}
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar pedido'}
        </button>
      </div>
    </div>
  )
}
