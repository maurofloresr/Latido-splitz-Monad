# Latido · Guardian Crypto

Una wallet diseñada para cuidar a quienes más queremos. Construida sobre Monad Testnet en la hackathon de Monad (junio 2026).

## Screenshots

### Home
<img width="1898" height="858" alt="home" src="https://github.com/user-attachments/assets/374d9551-979c-4662-957f-ba55152718ea" />

### Elegir rol
<img width="1255" height="783" alt="login" src="https://github.com/user-attachments/assets/8be35c54-4b6d-4140-8996-6d091834529c" />

### Vista Guardian
<img width="1153" height="871" alt="guardian" src="https://github.com/user-attachments/assets/319a9f50-fba7-4fb5-8b31-1e13770b0e3d" />

### Vista Dependiente
<img width="267" height="554" alt="cuenta" src="https://github.com/user-attachments/assets/547bb37b-86dc-4116-83f7-9d9bf96a0355" />

## ¿Qué es Latido?

Latido permite que un guardian administre fondos en USDT para sus familiares o dependientes. El guardian deposita, controla y puede ver el historial de gastos. El dependiente gasta desde una interfaz simple, como si fuera una tarjeta prepaga en blockchain.

## Stack

- Solidity 0.8.28 · Monad Testnet
- Hardhat para deploy
- React + Vite para el frontend
- ethers.js v6
- USDT (ERC-20)

## Estructura
latido/
├── contracts/     Contrato Solidity + Hardhat
└── frontend/      App React + Vite

## Contrato deployado

- **Red:** Monad Testnet
- **Contrato:** `0x35f22451b1Dc791252485B0BE6AEE529edc63E30`
- **USDT:** `0x88b8e2161dedc77ef4ab7585569d2415a1c1055d`

## Correr el frontend

```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

- Guardian agrega dependientes por wallet
- Deposita y retira USDT
- Ve historial de gastos de cada cuenta
- Aprueba pedidos de más fondos
- Dependiente anota gastos desde una interfaz mobile
- Pedido de fondos al guardian con motivo

## Roadmap

- Chainlink Automation para depósitos periódicos automáticos
- Notificaciones al guardian cuando hay un gasto
- Deploy en Monad Mainnet
