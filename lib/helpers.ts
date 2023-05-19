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
