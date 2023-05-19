import {
  getMarketName,
  getSelectionName,
} from 'https://esm.sh/@azuro-org/dictionaries@3.0.1'
import dayjs from 'https://esm.sh/dayjs@1.11.7'

import { GATEWAY_FM_KEY, TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
import { getBetsHistory } from '../lib/getBetsHistory.ts'
import { Bot, Context, session, SessionFlavor } from './deps.ts'
import { freeStorage } from 'https://deno.land/x/grammy_storages@v2.2.0/free/src/mod.ts'
import { convertWeiToGwei } from '../lib/helpers.ts'

interface RpcResponse {
  jsonrpc: string
  result: string
  id: number
}

interface SessionData {
  count: number
}
type BotContext = Context & SessionFlavor<SessionData>

export const bot = new Bot<BotContext>(TELEGRAM_BOT_TOKEN, {
  client: {
    timeoutSeconds: 60,
    canUseWebhookReply: (method) => {
      console.log('botConfig :', method)
      return true
    },
  },
})

bot.use(
  session({
    initial: () => ({ count: 0 }),
    storage: freeStorage<SessionData>(bot.token),
  }),
)

/*
 * Bot Commands
 */
bot.command('bets', async (ctx) => {
  let replyMessage = ''
  try {
    // const actorAddress = '0xb57fc8e76e9531137d698f41a5ec527b22bfc4b3'
    const actorAddress = ctx.match
    const result = await getBetsHistory(actorAddress)
    result.data.bets.map((bet) => {
      const { amount, potentialPayout, status, odds, outcome } = bet

      const isWin = outcome.outcomeId === outcome.condition.wonOutcome?.outcomeId
      const isResolved = status === 'Resolved'
      const isCanceled = status === 'Canceled'

      const betOdds = parseFloat(odds).toFixed(4) + 'USDT'
      const betAmount = parseFloat(amount).toFixed(2) + 'USDT'
      const possibleWin = parseFloat(potentialPayout).toFixed(2) + 'USDT'
      const betStatus = isResolved
        ? isWin
          ? 'Win'
          : 'Lose'
        : isCanceled
        ? 'Canceled'
        : 'Pending'

      const marketName = getMarketName({ outcomeId: outcome.outcomeId })
      const selectionName = getSelectionName({ outcomeId: outcome.outcomeId })
      replyMessage +=
        `*Market* ${marketName} \n` +
        `*Selection* ${selectionName} \n` +
        `*Odds* ${betOdds} \n` +
        `*Bet Amount* ${betAmount} \n` +
        `*Possible Win* ${possibleWin} \n` +
        `*Status* ${betStatus}  \n` +
        `${bet.game.sport.name} \n` +
        `${dayjs(+bet.game.startsAt * 1000).format('DD MMM HH:mm')} \n` +
        `${bet.game.league.country.name} - ${bet.game.league.name} \n\n`
      // const gameInfo =
    })
  } catch (error) {}

  ctx.reply(replyMessage, { parse_mode: 'Markdown' })
})

bot.command('gasprice', async (ctx) => {
  const url = 'https://rpc.eu-central-2.gateway.fm/v4/gnosis/non-archival/mainnet'

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', `Bearer ${GATEWAY_FM_KEY}`)

  const raw = JSON.stringify({
    method: 'eth_gasPrice',
    params: [],
    id: 1,
    jsonrpc: '2.0',
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  }

  let gasPrice = null
  try {
    const response = await fetch(url, requestOptions)
    const data: RpcResponse = await response.json()
    console.log(data)
    const weiValue = parseInt(data.result, 16)
    gasPrice = convertWeiToGwei(weiValue)
  } catch (error) {
    console.log('error', error)
  }

  ctx.reply(`Gas Price: ${gasPrice} gwei`)
})

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))
