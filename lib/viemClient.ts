import { createPublicClient, http } from 'https://esm.sh/viem@0.3.31'
import { gnosis } from 'https://esm.sh/viem@0.3.31/chains'

const transport = http('https://rpc.gnosis.gateway.fm')

export const publicClient = createPublicClient({
  chain: gnosis,
  transport,
})
