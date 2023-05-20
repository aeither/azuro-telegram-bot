import { gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { apolloClient } from './apolloClient.ts'

interface Sport {
  __typename: string
  name: string
}

interface Country {
  __typename: string
  name: string
}

interface Participant {
  __typename: string
  name: string
  image: string
}

interface LiquidityPoolContract {
  __typename: string
  address: string
}

interface Outcome {
  id: string
  outcomeId: string
  odds: string
}

interface Condition {
  __typename: string
  conditionId: string
  coreAddress: string
  status: string
  outcomes: Outcome[] // The type of "outcomes" is not specified in the provided JSON
  core: any // The type of "core" is not specified in the provided JSON
}

interface League {
  __typename: string
  name: string
  country: Country
}

interface Game {
  __typename: string
  sport: Sport
  league: League
  participants: Participant[]
  startsAt: string
  liquidityPool: LiquidityPoolContract
  conditions: Condition[]
}

interface EventData {
  game: Game;
}

const QUERY = `
  query Game($id: String!) {
    game(id: $id) {
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
      liquidityPool {
        address
      }
      conditions {
        conditionId
        coreAddress
        status
        outcomes {
          id
          outcomeId
          odds
        }
        core {
          address
          type
        }
      }
    }
  }
`

export async function getSportEvent(eventId: string) {
  try {
    const result = await apolloClient.query<EventData>({
      query: gql`
        ${QUERY}
      `,
      variables: {
        id: eventId,
      },
    })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
