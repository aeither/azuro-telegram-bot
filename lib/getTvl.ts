import { gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { apolloClient } from './apolloClient.ts'
import { TvlsData } from './types.ts'

const QUERY = `
query LiquidityPool($first: Int) {
  liquidityPoolContracts(
    first: $first
    orderDirection: desc
  ) {
    id
    chainId
    chainName
    address
    betsAmount
    betsCount
    depositedAmount
    withdrawnAmount
    rawTvl
    tvl
    rawApr
    apr
  }
}
`

export async function getTvls() {
  try {
    const result = await apolloClient.query<TvlsData>({
      query: gql`
        ${QUERY}
      `,
      variables: {
        first: 10,
      },
    })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
