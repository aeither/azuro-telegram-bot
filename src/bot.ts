import {
  getMarketName,
  getSelectionName,
} from 'https://esm.sh/@azuro-org/dictionaries@3.0.1'
import dayjs from 'https://esm.sh/dayjs@1.11.7'

import { TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
import { getBetsHistory } from '../lib/getBetsHistory.ts'
import { Bot } from './deps.ts'

export const bot = new Bot(TELEGRAM_BOT_TOKEN, {
  client: {
    timeoutSeconds: 60,
    canUseWebhookReply: (method) => {
      console.log('botConfig :', method)
      return true
    },
  },
})

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

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))
