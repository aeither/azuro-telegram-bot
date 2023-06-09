import { load } from '../src/deps.ts'

// export dotenv to Deno.env
await load({ export: true })

/**
 * Deno env
 */
export const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') as string
if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not found')

export const TELEGRAM_BOT_TOKEN_LIVE = Deno.env.get('TELEGRAM_BOT_TOKEN_LIVE') as string
if (!TELEGRAM_BOT_TOKEN_LIVE) throw new Error('TELEGRAM_BOT_TOKEN_LIVE not found')

export const GATEWAY_FM_KEY = Deno.env.get('GATEWAY_FM_KEY') as string
if (!GATEWAY_FM_KEY) throw new Error('GATEWAY_FM_KEY not found')

export const FAUCET_PRIVATE_KEY = Deno.env.get('FAUCET_PRIVATE_KEY') as string
if (!FAUCET_PRIVATE_KEY) throw new Error('FAUCET_PRIVATE_KEY not found')
