import { bot } from './bot.ts'
import { serve, webhookCallback } from './deps.ts'

const handleUpdate = webhookCallback(bot, 'std/http')

serve(async (req) => {
  if (req.method == 'POST') {
    const url = new URL(req.url)
    if (url.pathname.slice(1) == bot.token) {
      try {
        return await handleUpdate(req)
      } catch (err) {
        console.error(err)
      }
    }
  }
  return new Response()
})
