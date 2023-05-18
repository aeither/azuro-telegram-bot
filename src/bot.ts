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

/**
 * Bot Commands
 */
bot.command('start', async (ctx) => {
  try {
    // const actorAddress = '0xb57fc8e76e9531137d698f41a5ec527b22bfc4b3'
    const actorAddress = ctx.match
    const result = await getBetsHistory(actorAddress)

    // Handle the result as needed
  } catch (error) {
    // Handle any errors
  }

  ctx.reply('Welcome! Up and running.')
})

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))
