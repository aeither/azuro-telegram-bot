import { ApolloClient, InMemoryCache, gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { BetData } from './types.ts'

/**
 * GraphQL
 */
const cache = new InMemoryCache()

const client = new ApolloClient({
  cache,
  uri: 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-gnosis',
})

/**
 * Queries
 */
const QUERY = `
  query BetsHistory($first: Int, $where: Bet_filter!) {
    bets(
      first: $first,
      orderBy: createdBlockTimestamp,
      orderDirection: desc,
      where: $where,
      subgraphError: allow
    ) {
      id
      betId
      amount
      potentialPayout
      status
      isRedeemed
      odds
      createdAt: createdBlockTimestamp
      txHash: createdTxHash
      outcome {
        id
        outcomeId
        condition {
          id
          conditionId
          wonOutcome {
            outcomeId
          }
          core {
            address
            liquidityPool {
              address
            }
          }
        }
      }
      game {
        id
        sport {
          name
        }
        league {
          name
          country {
            name
          }
        }
        participants {
          name
          image
        }
        startsAt
      }
    }
  }
`

export async function getBetsHistory(actorAddress: string) {
  const formattedAddress = actorAddress.replace(/\s/g, '') // Remove spaces from the address

  try {
    const result = await client.query<BetData>({
      query: gql`
        ${QUERY}
      `,
      variables: {
        first: 10,
        where: {
          actor: formattedAddress.toLowerCase(),
        },
      },
    })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
