import { TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
import { Bot } from './deps.ts'
import { ApolloClient, InMemoryCache, gql } from 'https://esm.sh/@apollo/client@3.7.14'

export const bot = new Bot(TELEGRAM_BOT_TOKEN, {
  client: {
    timeoutSeconds: 60,
    canUseWebhookReply: (method) => {
      console.log('botConfig :', method)
      return true
    },
  },
})

/**
 * GraphQL
 */
const cache = new InMemoryCache()

const client = new ApolloClient({
  cache,
  uri: 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-gnosis',
})

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

/**
 * Bot Commands
 */
bot.command('start', (ctx) => {
  client
    .query({
      query: gql`
        ${QUERY}
      `,
      variables: {
        first: 10, // in this tutorial, only 10 bets are loaded. In production, pagination loading should be implemented to avoid heavy requests which can lead to GraphQL errors
        where: {
          actor: '0xb57fc8e76e9531137d698f41a5ec527b22bfc4b3'.toLowerCase(),
        },
      },
    })
    .then((result) => console.log(result))

  ctx.reply('Welcome! Up and running.')
})

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))
