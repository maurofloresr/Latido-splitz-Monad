export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS
export const MONAD_CHAIN_ID = parseInt(import.meta.env.VITE_MONAD_CHAIN_ID || '10143')
export const MONAD_RPC = import.meta.env.VITE_MONAD_RPC || 'https://testnet-rpc.monad.xyz'

export const MONAD_NETWORK = {
  chainId: `0x${MONAD_CHAIN_ID.toString(16)}`,
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: [MONAD_RPC],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
}

export const LATIDO_ABI = [
  "function addDependent(address _dependent) external",
  "function fundDependent(address _dependent, uint _amount) external",
  "function removeFunds(address _dependent, uint _amount) external",
  "function removeDependent(address _dependent) external",
  "function approveRequest(uint _requestId) external",
  "function spend(uint _amount, string calldata _description) external",
  "function requestMore(uint _amount, string calldata _reason) external",
  "function availableBalance(address _dependent) external view returns (uint)",
  "function getPaymentHistory(address _dependent) external view returns (tuple(uint amount, string description, uint timestamp)[])",
  "function getPendingRequests(address _guardian) external view returns (uint[])",
  "function getDependents(address _guardian) external view returns (address[])",
  "function guardianOf(address) external view returns (address)",
  "function dependents(address) external view returns (uint balance, bool active)",
  "function requests(uint) external view returns (address dependent, uint amount, string reason, bool pending)",
]

export const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
]

export const USDT_DECIMALS = 6
export const toUSDT = (amount) => BigInt(Math.round(parseFloat(amount) * 10 ** USDT_DECIMALS))
export const fromUSDT = (amount) => (Number(amount) / 10 ** USDT_DECIMALS).toFixed(2)
