import { TELEGRAM_BOT_TOKEN } from '../lib/constants.ts'
import { bot } from '../src/bot.ts'
import { BotCommand } from '../src/deps.ts'

const commands: BotCommand[] = [{ command: 'hi', description: 'Hi!!!' }]

/**
 * Update commands
 * Test and Live Bot
 */
// Local Bot Commands
await bot.api.setMyCommands(commands)

// Live Bot Commands
// const liveBot = new Bot(TELEGRAM_BOT_TOKEN_LIVE)
// await liveBot.api.setMyCommands(commands)

/**
 * Update Webhook
 */

// Update Local Webhook
const PROJECT_URL = 'https://411b-37-162-82-192.eu.ngrok.io'
await bot.api.setWebhook(`${PROJECT_URL}/${TELEGRAM_BOT_TOKEN}`)

// Update Live Webhook
// const PROJECT_URL = 'https://azuro-bot.deno.dev'
// await bot.api.setWebhook(`${PROJECT_URL}/${TELEGRAM_BOT_TOKEN_LIVE}`)
