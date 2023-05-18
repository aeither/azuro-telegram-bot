import { gql } from 'https://esm.sh/@apollo/client@3.7.14'
import { client } from './apolloClient.ts'

const QUERY = `
  query Games($where: Game_filter!) {
    games(first: 10, where: $where) {
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
`

export async function getSportEvents() {
  try {
    const result = await client.query<any>({
      query: gql`
        ${QUERY}
      `,
      variables: {
        where: {
          // note that the value of "startAt" is in seconds
          startsAt_gt: Math.floor(Date.now() / 1000),
          sport_: { name: 'Football' },
        },
      },
    })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
