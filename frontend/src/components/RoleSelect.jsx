import { shortAddress } from '../utils/format'

export default function RoleSelect({ address, onSelect, onDisconnect }) {
  return (
    <div className="role-select">
      <img src="/images/logo.png" alt="Latido" className="landing-logo" />
      <h2 className="role-title">¿Cómo querés entrar?</h2>
      <p className="role-addr">{shortAddress(address)}</p>
      <div className="role-cards">
        <button className="role-card" onClick={() => onSelect('guardian')}>
          <span className="role-icon">🛡️</span>
          <strong>Soy Guardian</strong>
          <span>Administro los fondos de mis familiares</span>
        </button>
        <button className="role-card" onClick={() => onSelect('dependent')}>
          <span className="role-icon">👤</span>
          <strong>Soy Dependiente</strong>
          <span>Mi guardian ya me agregó al contrato</span>
        </button>
      </div>
      <button className="btn-ghost" onClick={onDisconnect}>Desconectar</button>
    </div>
  )
}
