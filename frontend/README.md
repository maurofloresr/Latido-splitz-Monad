# Latido · Guardian Crypto

Wallet para gestionar fondos de familiares. Monad Testnet + USDT.

## Setup

```bash
npm install
npm run dev
```

## .env (ya incluido)
```
VITE_CONTRACT_ADDRESS=0x35f22451b1Dc791252485B0BE6AEE529edc63E30
VITE_USDT_ADDRESS=0x88b8e2161dedc77ef4ab7585569d2415a1c1055d
VITE_MONAD_CHAIN_ID=10143
VITE_MONAD_RPC=https://testnet-rpc.monad.xyz
```

## Imágenes — poner en /public/images/

| Archivo | Qué es |
|---|---|
| `logo.png` | Ícono naranja de Latido |
| `foto-inicio.png` | Foto del abuelo con la tarjeta (landing) |
| `tarjeta.png` | La tarjeta Latido (vista dependiente) |

## Flujo de roles
- **Guardian**: wallet con dependientes asignados → dashboard con 4 stats (mi saldo / saldo en cuentas / cuentas activas / pedidos pendientes)
- **Dependiente**: wallet con guardian asignado → vista mobile con tarjeta, anotar gasto, pedir más
- **Wallet nueva**: pantalla para elegir rol manualmente
