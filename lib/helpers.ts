export function convertWeiToGwei(weiValue: number): number {
  const gweiValue = weiValue / 10 ** 9
  return gweiValue
}

export function removeAddress(addresses: string[], addressToRemove: string) {
    const index = addresses.indexOf(addressToRemove);
    if (index !== -1) {
      addresses.splice(index, 1);
    }
    return addresses;
  }