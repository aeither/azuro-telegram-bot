import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_TOKEN_LIVE } from '../lib/constants.ts'
import { bot } from '../src/bot.ts'
import { Bot, BotCommand } from '../src/deps.ts'

const commands: BotCommand[] = [
  { command: 'bets', description: '{address} Show address bets history' },
  { command: 'gasprice', description: 'Use Gnosis Mainnet Gas Tracker' },
  { command: 'addwatchlist', description: '{address} Adds a new wallet to track' },
  { command: 'removewatchlist', description: '{address} Removes a wallet from tracking' },
  { command: 'watchlist', description: 'Lists all the tracked wallets' },
  { command: 'transactions', description: '{address} Show address transactions' },
  { command: 'balance', description: '{address} Show address balance on Gnosis Chain' },
  { command: 'tvl', description: 'Show Gnosis liquidity pool TVL' },
  { command: 'events', description: 'Show latest events' },
  { command: 'importwallet', description: '{address} Import wallet by private key' },
  { command: 'exportwallet', description: 'Export private key' },
  { command: 'faucet', description: '{address} Request 0.0001 Gnosis Mainnet xDAI' },
]

/**
 * Update commands
 * Test and Live Bot
 */
// Local Bot Commands
await bot.api.setMyCommands(commands)

// Live Bot Commands
const liveBot = new Bot(TELEGRAM_BOT_TOKEN_LIVE)
await liveBot.api.setMyCommands(commands)

/**
 * Update Webhook
 */

// Update Local Webhook
// const PROJECT_URL = `https://575c-37-163-157-138.ngrok-free.app`
// await fetch(
//   `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${PROJECT_URL}/${TELEGRAM_BOT_TOKEN}`,
// )

// Update Live Webhook
// const PROJECT_URL = 'https://aeither-azuro-telegram-bot.deno.dev'
// await fetch(
//   `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN_LIVE}/setWebhook?url=${PROJECT_URL}/${TELEGRAM_BOT_TOKEN_LIVE}`,
// )
//   .then((r) => r.json())
//   .then((r) => console.log(r))
