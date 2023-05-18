import { TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
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
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))
