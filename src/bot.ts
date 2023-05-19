import {
  getMarketName,
  getSelectionName,
} from 'https://esm.sh/@azuro-org/dictionaries@3.0.1'
import dayjs from 'https://esm.sh/dayjs@1.11.7'

import { freeStorage } from 'https://deno.land/x/grammy_storages@v2.2.0/free/src/mod.ts'
import { GATEWAY_FM_KEY, TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
import { getBetsHistory } from '../lib/getBetsHistory.ts'
import { getSportEvents } from '../lib/getSportEvents.ts'
import { getLiquidityPoolTransactions } from '../lib/getLiquidityPoolTransactions.ts'
import {
  convertWeiToGwei,
  formatTimestamp,
  formatWeiToEth,
  removeAddress,
} from '../lib/helpers.ts'
import { publicClient } from '../lib/viemClient.ts'
import { Bot, Context, SessionFlavor, session } from './deps.ts'
import { getTvls } from '../lib/getTvl.ts'

interface RpcResponse {
  jsonrpc: string
  result: string
  id: number
}

interface SessionData {
  addresses: string // Watchlist addresses
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
    initial: () => ({ addresses: '' }),
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

  ctx.reply(
    `Gas Price \n\n Slow: ${
      gasPrice ? (gasPrice * 0.9).toFixed(2) : null
    } gwei \n Normal: ${gasPrice} gwei (10-30 secs) \n Fast: ${
      gasPrice ? (gasPrice * 1.2).toFixed(2) : null
    } gwei`,
  )
})

bot.command('addwatchlist', (ctx) => {
  const address = ctx.match
  console.log('🚀 ~ file: bot.ts:123 ~ bot.command ~ address:', address)
  ctx.session.addresses += address + ','
  const formattedString = ctx.session.addresses
    .split(',')
    .map((address) => `\`/bets ${address}\``)
    .join('\n')

  ctx.reply(
    `Added ${address} to the Watchlist \n\n New Watchlist: \n ${formattedString}`,
    { parse_mode: 'Markdown' },
  )
})

bot.command('removewatchlist', (ctx) => {
  const address = ctx.match

  const updatedAddresses = removeAddress(ctx.session.addresses.split(','), address)
  ctx.session.addresses = updatedAddresses.join(',')

  const formattedString = updatedAddresses
    .map((address) => `\`/bets ${address}\``)
    .join('\n')

  ctx.reply(
    `Address ${address} removed from the Watchlist \n\n New Watchlist: \n ${formattedString}`,
    { parse_mode: 'Markdown' },
  )
})

bot.command('watchlist', (ctx) => {
  const formattedString = ctx.session.addresses
    .split(',')
    .map((address) => `\`/bets ${address}\``)
    .join('\n')

  ctx.reply(`Watchlist: \n ${formattedString}`, { parse_mode: 'Markdown' })
})

bot.command('transactions', async (ctx) => {
  function shortenAddress(address: string, charsToShow = 4): string {
    const prefix = address.slice(0, charsToShow)
    const suffix = address.slice(-charsToShow)
    return `${prefix}...${suffix}`
  }

  let replyMessage = ''
  try {
    // const actorAddress = '0xef18f2f054a7ad2909333051aa42d5c0bb3f92f6'
    const actorAddress = ctx.match
    const result = await getLiquidityPoolTransactions(actorAddress)

    result.data.liquidityPoolTransactions.map((tx) => {
      const { amount, blockTimestamp, txHash, type } = tx

      const formattedDate = formatTimestamp(+blockTimestamp)
      const formattedHash = shortenAddress(txHash)

      replyMessage +=
        `${formattedDate} \n` +
        `${type} ${amount} xDAI \n` +
        `*Hash* [${formattedHash}](https://gnosisscan.io/tx/${txHash}) \n\n`
    })
  } catch (error) {}

  ctx.reply(replyMessage, { parse_mode: 'Markdown' })
})

bot.command('balance', async (ctx) => {
  const address = ctx.match as `0x${string}`

  const balance = await publicClient.getBalance({
    address: address,
  })

  const formattedValue = formatWeiToEth(balance)

  ctx.reply(`Balance: ${formattedValue}`)
})

bot.command('tvl', async (ctx) => {
  let replyMessage = ''
  try {
    const tvls = await getTvls()

    tvls.data.liquidityPoolContracts.map((tvlData) => {
      const {
        rawTvl,
        address,
        betsCount,
        betsAmount,
        depositedAmount,
        withdrawnAmount,
        apr,
      } = tvlData

      replyMessage +=
        `*Contract* [${address}](https://gnosisscan.io/address/${address}) \n` +
        `*Bets amount* ${formatWeiToEth(betsAmount)} \n` +
        `*Bets count* ${betsCount} \n` +
        `*Deposited* ${formatWeiToEth(depositedAmount)} \n` +
        `*Withdrawn* ${formatWeiToEth(withdrawnAmount)} \n` +
        `*TVL* ${formatWeiToEth(rawTvl)} \n` +
        `*APR* ${apr} \n\n`
    })
  } catch (error) {}

  ctx.reply(`${replyMessage}`, { parse_mode: 'Markdown' })
})

bot.command('events', async (ctx) => {
  let replyMessage = ''
  try {
    const events = await getSportEvents()

    events.data.games.map((event) => {
      const { league, participants, sport, startsAt } = event

      replyMessage +=
        `${sport.name} \n` +
        `${league.name} - ${league.country.name} \n` +
        `${formatTimestamp(+startsAt)} \n` +
        `*Participants* ${participants.map((p) => p.name).join(', ')} \n\n`
    })
  } catch (error) {}

  ctx.reply(`${replyMessage}`, { parse_mode: 'Markdown' })
})

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))
