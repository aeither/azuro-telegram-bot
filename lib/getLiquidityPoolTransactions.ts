import { gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { client } from './apolloClient.ts'
import { TransactionsData } from './types.ts'

const QUERY = `
  query LiquidityPool($first: Int, $where: LiquidityPoolTransaction_filter! ) {
    liquidityPoolTransactions(
      first: $first
      orderDirection: desc
      where: $where
    ) {
      id
      account
      amount
      txHash
      type
      blockTimestamp
    }
  }
`

export async function getLiquidityPoolTransactions(actorAddress: string) {
  console.log(
    '🚀 ~ file: getLiquidityPoolNfts.ts:31 ~ getLiquidityPoolTransactions ~ actorAddress:',
    actorAddress,
  )
  const formattedAddress = actorAddress.replace(/\s/g, '') // Remove spaces from the address

  try {
    const result = await client.query<TransactionsData>({
      query: gql`
        ${QUERY}
      `,
      variables: {
        first: 10,
        where: {
          account: formattedAddress.toLowerCase(),
        },
      },
    })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
