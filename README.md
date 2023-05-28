<br />
<div align="center">
  <a href="https://github.com/aeither/azuro-telegram-bot">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Azuro Telegram Bot</h3>

  <p align="center">
    Bet and check statistics on Gnosis
    <br />
  </p>
</div>

# Azuro Telegram Bot

- Demo

## Tech Stack

grammyjs, typescript, azuro protocol, deno

### Summary

Azuro Telegram Bot is a powerful tool that provides users with quick and convenient access to decentralized betting while on the go. With this bot, users can engage in secure and transparent betting activities directly through the popular messaging platform Telegram. It enable the users to

- Import Wallet and Bet
- Check Gas Price
- Track Wallets
- Check History
- Check Balance
- Check Pool TVL
- Explore Events
- Request xDAI from Faucet

### Azuro Protocol

Azuro + theGraph is used to query all the datas like bets, events or tvls.

```jsx
export const apolloClient = new ApolloClient({
  cache,
  uri: 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-gnosis',
})
```

Interact with Azuro smart contracts on Gnosis

```jsx
    const tx = await lpContract.betNative(
      coreAddress,
      deadline,
      {
        affiliate,
        data,
      },
      { value: rawAmount },
    )
```

Toolkit and dictionaries to format data output.

```jsx
import {
  getMarketName,
  getSelectionName,
} from 'https://esm.sh/@azuro-org/dictionaries@3.0.1'
import { aggregateOutcomesByMarkets } from 'https://esm.sh/@azuro-org/toolkit@3.0.0'
```

### Gateway
FM

Gateway RPC is used to access on-chain data as well as provider for user's wallet to interact with smart contracts.

```jsx
const RPC_PROVIDER = 'https://rpc.gnosis.gateway.fm'

const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER)
const wallet = new ethers.Wallet(ctx.session.privKey, provider)
const lpContract = new ethers.Contract(lpAddress, LP_ABI, wallet)
```

```jsx
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
```

### Gnosis Chain

The bot enable users to interact with protocol deployed on Gnosis from Telegram.

Enable users to easily request from xDAI to start using Gnosis Chain on the go.

```jsx

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
```

## Installation

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```

## Usage

## Roadmap

## Images

Examples

Successful Bet

https://gnosisscan.io/tx/0x67aada2d4fd42f236ee4d8ddd511af87ee39911612b120d07bf2735c5f185af4
