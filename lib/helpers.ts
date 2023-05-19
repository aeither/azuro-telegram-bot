export function convertWeiToGwei(weiValue: number): number {
  const gweiValue = weiValue / 10 ** 9
  return gweiValue
}

export function removeAddress(addresses: string[], addressToRemove: string) {
  const index = addresses.indexOf(addressToRemove)
  if (index !== -1) {
    addresses.splice(index, 1)
  }
  return addresses
}

export function formatWeiToEth(wei: string | number | bigint): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : BigInt(wei)
  const ethValue = weiValue / BigInt(10 ** 18) // 1 Ether = 10^18 Wei
  return ethValue.toString()
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'UTC',
  }
  return date.toLocaleString('en-US', options)
}

export function shortenAddress(address: string, charsToShow = 4): string {
  const prefix = address.slice(0, charsToShow)
  const suffix = address.slice(-charsToShow)
  return `${prefix}...${suffix}`
}
