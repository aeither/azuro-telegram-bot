import { gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { client } from './apolloClient.ts'

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
    const result = await client.query<any>({
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
