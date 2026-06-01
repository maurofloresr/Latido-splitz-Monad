export default function LandingPage({ onConnect, connecting, error }) {
  return (
    <div className="landing">
      <div className="landing-left">
        <img src="/images/logo.png" alt="Latido" className="landing-logo" />
        <h1 className="landing-title">
          Una wallet que cuida<br />
          <span className="accent">a quienes más amamos</span>
        </h1>
        <p className="landing-sub">
          Enviá fondos a tus familiares con total control. Ellos gastan, vos supervisás. Simple, seguro, en blockchain.
        </p>
        <button className="btn-connect" onClick={onConnect} disabled={connecting}>
          {connecting ? (
            <><span className="spinner-sm" /> Conectando...</>
          ) : (
            'Conectar Wallet'
          )}
        </button>
        {error && <p className="landing-error">{error}</p>}
        <p className="landing-hint">Necesitás MetaMask · Red Monad Testnet</p>
      </div>
      <div className="landing-right">
        <div className="card-3d">
          <img src="/images/foto-inicio.png" alt="Latido Card" className="landing-img" />
        </div>
      </div>
    </div>
  )
}
