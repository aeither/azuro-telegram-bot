import {
  createPublicClient,
  createWalletClient,
  gnosis,
  http,
  privateKeyToAccount,
} from '../src/deps.ts'
import { FAUCET_PRIVATE_KEY } from './constants.ts'

const transport = http('https://rpc.gnosis.gateway.fm')

export const publicClient = createPublicClient({
  chain: gnosis,
  transport,
})

const account = privateKeyToAccount(FAUCET_PRIVATE_KEY as `0x${string}`)
export const faucetClient = createWalletClient({
  account,
  chain: gnosis,
  transport,
})
