# Latido · Guardian Crypto

Una wallet diseñada para cuidar a quienes más queremos. Construida sobre Monad Testnet en la hackathon de Monad (junio 2026).

## Demo
[![Demo en YouTube](https://img.shields.io/badge/Ver%20demo-YouTube-red?style=for-the-badge&logo=youtube)](ACÁ_TU_LINK)

## Screenshots

### Home
<img width="1920" height="1080" alt="home" src="https://github.com/user-attachments/assets/244ea339-1867-4e7c-b87b-5d43922c47e9" />

### Elegir rol
<img width="1920" height="1080" alt="login" src="https://github.com/user-attachments/assets/bc18e7ce-47ef-42aa-9bf9-bc77564a1448" />

### Vista Guardian
<img width="1920" height="1080" alt="guardian" src="https://github.com/user-attachments/assets/40230241-adc1-430e-9bb1-6258cdcd5a1e" />

### Vista Dependiente
<img width="1920" height="1080" alt="cuenta" src="https://github.com/user-attachments/assets/75fac2e4-789b-41bd-8d91-6194dd6ea035" />


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
