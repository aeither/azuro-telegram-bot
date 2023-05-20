import { gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { apolloClient } from './apolloClient.ts'

interface Condition {
  id: string
  conditionId: string
  wonOutcome: {
    outcomeId: string
  }
  core: {
    address: string
    liquidityPool: {
      address: string
    }
  }
}

interface LiquidityPool {
  address: string
}

interface Participant {
  name: string
  image: string
}

interface Outcome {
  id: string
  outcomeId: string
  condition: Condition
}

interface Game {
  id: string
  sport: {
    name: string
  }
  league: {
    name: string
    country: {
      name: string
    }
  }
  participants: Participant[]
  startsAt: string
  liquidityPool: LiquidityPool
  conditions: Condition[]
}

/**
 * getBetsHistory
 */

interface Bet {
  __typename: string
  id: string
  betId: string
  amount: string
  potentialPayout: string
  status: string
  isRedeemed: boolean
  odds: string
  createdAt: string
  txHash: string
  outcome: Outcome
  game: Game
}

interface BetData {
  bets: Bet[]
}

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
    const result = await apolloClient.query<BetData>({
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
