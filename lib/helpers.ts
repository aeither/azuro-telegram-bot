export function convertWeiToGwei(weiValue: number): number {
  const gweiValue = weiValue / 10 ** 9
  return gweiValue
}
