const KEY = 'latido_aliases'

export const saveAlias = (address, name) => {
  const a = getAll()
  a[address.toLowerCase()] = name
  localStorage.setItem(KEY, JSON.stringify(a))
}

export const getAlias = (address) => {
  if (!address) return ''
  return getAll()[address.toLowerCase()] || ''
}

export const getDisplayName = (address) => {
  if (!address) return ''
  const alias = getAlias(address)
  return alias || `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getAll = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
