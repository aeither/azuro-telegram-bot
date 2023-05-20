import { freeStorage } from 'https://deno.land/x/grammy_storages@v2.2.0/free/src/mod.ts'
import {
  getMarketName,
  getSelectionName,
} from 'https://esm.sh/@azuro-org/dictionaries@3.0.1'
import { ethers } from 'https://esm.sh/ethers@5.7.2'
import { aggregateOutcomesByMarkets } from 'https://esm.sh/@azuro-org/toolkit@3.0.0'
import dayjs from 'https://esm.sh/dayjs@1.11.7'
import { GATEWAY_FM_KEY, TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
import { getBetsHistory } from '../lib/getBetsHistory.ts'
import { getLiquidityPoolTransactions } from '../lib/getLiquidityPoolTransactions.ts'
import { getSportEvent } from '../lib/getSportEvent.ts'
import { getSportEvents } from '../lib/getSportEvents.ts'
import { getTvls } from '../lib/getTvl.ts'
import {
  convertWeiToGwei,
  formatTimestamp,
  formatWeiToEth,
  removeAddress,
  shortenAddress,
} from '../lib/helpers.ts'
import { LP_ABI } from '../lib/lpAbi.ts'
import { faucetClient, publicClient } from '../lib/viemClient.ts'
import {
  Bot,
  Context,
  InlineKeyboard,
  SessionFlavor,
  createWalletClient,
  encodeAbiParameters,
  gnosis,
  http,
  parseAbiParameters,
  parseEther,
  parseUnits,
  privateKeyToAccount,
  session,
} from './deps.ts'

interface RpcResponse {
  jsonrpc: string
  result: string
  id: number
}

interface SessionData {
  addresses: string // Watchlist addresses
  privKey: string
  cooldownTimestamp: number
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
    initial: () => ({ addresses: '', privKey: '', cooldownTimestamp: 1 }),
    storage: freeStorage<SessionData>(bot.token),
  }),
)

/*
 * Bot Commands
 */
bot.command('bets', async (ctx) => {
  let replyMessage = ''
  let profit = 0

  try {
    // const actorAddress = '0x7d2f1f75bd76da9558bd0c8bfc0618c96a6d40e5'
    const actorAddress = ctx.match
    const result = await getBetsHistory(actorAddress)

    result.data.bets.map((bet) => {
      const { amount, potentialPayout, status, odds, outcome } = bet

      const isWin = outcome.outcomeId === outcome.condition.wonOutcome?.outcomeId
      const isResolved = status === 'Resolved'
      const isCanceled = status === 'Canceled'

      const betOdds = parseFloat(odds).toFixed(4) + 'WXDAI'
      const betAmount = parseFloat(amount).toFixed(2) + 'WXDAI'
      const possibleWin = parseFloat(potentialPayout).toFixed(2) + 'WXDAI'
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

      if (betStatus === 'Lose') {
        profit -= parseFloat(amount)
      } else if (betStatus === 'Win') {
        profit += parseFloat(potentialPayout)
      }
    })
  } catch (error) {}

  ctx.reply(replyMessage, { parse_mode: 'Markdown' })
  ctx.reply(`Win/Loss: ${profit.toFixed(2)} WXDAI`, { parse_mode: 'Markdown' })
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
  // const address = '0xef18f2f054a7ad2909333051aa42d5c0bb3f92f6'
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
  const eventsKeyboard = new InlineKeyboard()

  try {
    const events = await getSportEvents()

    events.data.games.map((event) => {
      const { league, participants, sport, startsAt, id } = event // game

      eventsKeyboard
        .text(participants.map((p) => p.name).join(' - '), 'event:' + id)
        .row()

      replyMessage +=
        `${sport.name} \n` +
        `${league.name} - ${league.country.name} \n` +
        `${formatTimestamp(+startsAt)} \n` +
        `*Participants* ${participants.map((p) => p.name).join(' - ')} \n\n`
    })
  } catch (error) {}

  ctx.reply(`${replyMessage}`, {
    reply_markup: eventsKeyboard,
    parse_mode: 'Markdown',
  })
})

bot.command('importwallet', (ctx) => {
  const privateKey = ctx.match
  ctx.session.privKey = privateKey

  ctx.reply(`Wallet Imported`, { parse_mode: 'Markdown' })
})

bot.command('exportwallet', (ctx) => {
  ctx.reply(`Your private key is ${ctx.session.privKey}`, { parse_mode: 'Markdown' })
})

bot.command('faucet', async (ctx) => {
  function compareTimestampToNow(timestamp: number): {
    hasSurpassed: boolean
    diffInHours: number
  } {
    const now = Date.now()
    const hasSurpassed = now > timestamp
    const diffInMilliseconds = Math.abs(now - timestamp)
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))

    return { hasSurpassed, diffInHours }
  }

  // check if user can request faucet
  const { hasSurpassed, diffInHours } = compareTimestampToNow(
    ctx.session.cooldownTimestamp || 1,
  )

  if (!hasSurpassed) {
    ctx.reply(
      `You have requested in the last 24 hours. You can request again after ${diffInHours}`,
      {
        parse_mode: 'Markdown',
      },
    )
    return
  }

  // Update cooldown
  const now = Date.now()
  const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  ctx.session.cooldownTimestamp = now + twentyFourHoursInMilliseconds

  // Send xDAI
  const toAddress = ctx.match as `0x${string}` | undefined

  const txHash = await faucetClient.sendTransaction({
    to: toAddress,
    value: parseEther('0.0001'),
  })
  const formattedHash = shortenAddress(txHash)

  ctx.reply(
    `*xDAI Requested successfully* [${formattedHash}](https://gnosisscan.io/tx/${txHash}) \n\n`,
    {
      parse_mode: 'Markdown',
    },
  )
})

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))

/**
 * Listen to button events
 */

interface Outcome {
  conditionId: string
  outcomeId: string
  lpAddress: string
  coreAddress: string
  selectionName: string
  __typename: string
  id: string
  odds: string
}

bot.on('callback_query:data', async (ctx) => {
  if (ctx.callbackQuery.data.indexOf('bet:') !== -1) {
    /**
     * If select on bet/win condition
     */
    // const RPC_PROVIDER = 'https://rpc.gnosis.gateway.fm'
    // const payload = ctx.callbackQuery.data
    // const lpAddress = '0x204e7371ade792c5c006fb52711c50a7efc843ed'
    // const coreAddress = '0xc95c831c7bdb0650b8cd5f2a542b263872d8ed0e'
    // const [, conditionId, outcomeId, odds] = payload.split(':')
    // console.log('🚀 ~ file: bot.ts:374 ~ bot.on ~ lpAddress:', lpAddress)
    // const wagmiContractConfig = {
    //   address: lpAddress,
    //   abi: LP_ABI,
    // }
    // const deadline = Math.floor(Date.now() / 1000) + 2000
    // const affiliate = '0x2a4De22d912dc6D79655D9fdb7068D3599a4C375' as `0x${string}`
    // const betAmount = 100 // 100 xDAI
    // const tokenDecimals = 18 // xDAI has 18 decimals
    // const rawAmount = parseUnits(`${betAmount}`, tokenDecimals)
    // const slippage = 5
    // const minOdds = 1 + ((+odds - 1) * (100 - slippage)) / 100
    // const rawMinOdds = parseUnits(`${minOdds}`, 12)
    // const data = encodeAbiParameters(parseAbiParameters('uint256, uint64, uint64'), [
    //   BigInt(conditionId),
    //   BigInt(outcomeId),
    //   rawMinOdds,
    // ])
    // const { request } = await publicClient.simulateContract({
    //   ...wagmiContractConfig,
    //   functionName: 'betNative',
    //   value: parseEther('0.01'),
    //   account: affiliate,
    //   args: [
    //     // deno-lint-ignore no-explicit-any
    //     coreAddress as any,
    //     BigInt(deadline),
    //     {
    //       affiliate,
    //       data,
    //     },
    //   ],
    // })
    // const transport = http('https://rpc.gnosis.gateway.fm')
    // const account = privateKeyToAccount(ctx.session.privKey as `0x${string}`)
    // const walletClient = createWalletClient({
    //   account,
    //   chain: gnosis,
    //   transport,
    // })
    // const hash = await walletClient.writeContract(request)
    // ctx.reply(`Tx: ${shortenAddress(hash)}`, {
    //   parse_mode: 'Markdown',
    // })

    const RPC_PROVIDER = 'https://rpc.gnosis.gateway.fm'
    const payload = ctx.callbackQuery.data
    const lpAddress = '0x204e7371ade792c5c006fb52711c50a7efc843ed'
    const coreAddress = '0xc95c831c7bdb0650b8cd5f2a542b263872d8ed0e'
    const [, conditionId, outcomeId, odds] = payload.split(':')

    const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER)
    const wallet = new ethers.Wallet(ctx.session.privKey, provider)
    const lpContract = new ethers.Contract(lpAddress, LP_ABI, wallet)

    const deadline = Math.floor(Date.now() / 1000) + 2000
    const affiliate = '...'

    const betAmount = 1 // 100 xDAI
    const tokenDecimals = 18 // xDAI has 18 decimals
    const rawAmount = ethers.utils.parseUnits(String(betAmount), tokenDecimals)

    const slippage = 5
    const minOdds = 1 + ((+odds - 1) * (100 - slippage)) / 100
    const rawMinOdds = ethers.utils.parseUnits(String(minOdds), 12)

    const data = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint64', 'uint64'],
      [conditionId, outcomeId, rawMinOdds],
    )

    lpContract.betNative(
      coreAddress,
      deadline,
      {
        affiliate,
        data,
      },
      { value: rawAmount },
    )
  } else if (ctx.callbackQuery.data.indexOf('event:') !== -1) {
    /**
     * If select market from markets list
     */
    const eventId = ctx.callbackQuery.data.split(':')[1]

    const { data } = await getSportEvent(eventId)
    const { conditions, liquidityPool, participants } = data.game

    /**
     * Show bet buttons
     */
    const markets = aggregateOutcomesByMarkets({
      lpAddress: liquidityPool.address,
      conditions,
    })
    const betKeyboard = new InlineKeyboard()

    // Iterate over the array and add concatenations dynamically
    for (const market of markets) {
      if (market.marketName === 'Full Time Result') {
        market.outcomes[0].map((outcome) => {
          const { conditionId, outcomeId, odds, selectionName } = outcome as Outcome
          const payload = `bet:${conditionId}:${outcomeId}:${odds}`

          betKeyboard.text(`${selectionName} - ${parseFloat(odds).toFixed(2)}`, payload)
        })
      }
    }

    ctx.reply(participants.map((p) => p.name).join(' - '), {
      reply_markup: betKeyboard,
      parse_mode: 'Markdown',
    })
  }

  await ctx.answerCallbackQuery() // remove loading animation
})
