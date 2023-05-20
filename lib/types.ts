interface Outcome {
  id: string
  outcomeId: string
  odds: string
}

interface Core {
  address: string
  type: string
}

interface Condition {
  conditionId: string
  status: string
  outcomes: Outcome[]
  core: Core
}

interface Participant {
  name: string
  image: string
}

interface LiquidityPool {
  address: string
}

interface Game {
  id: string
  sport: {
    name: string
  }
  league: {
    name: string
    country: {
      name: string
    }
  }
  participants: Participant[]
  startsAt: string
  liquidityPool: LiquidityPool
  conditions: Condition[]
}

export interface EventsData {
  games: Game[]
}

/**
 * getLiquidityPoolTransactions
 */

interface LiquidityPoolTransaction {
  __typename: string
  id: string
  account: string
  amount: string
  txHash: string
  type: string
  blockTimestamp: string
}

export interface TransactionsData {
  liquidityPoolTransactions: LiquidityPoolTransaction[]
}

/**
 * getTvl
 */

type LiquidityPoolContract = {
  __typename: string
  id: string
  chainId: number
  chainName: string
  address: string
  betsAmount: string
  betsCount: string
  depositedAmount: string
  withdrawnAmount: string
  rawTvl: string
  tvl: string
  rawApr: string
  apr: string
}

export type TvlsData = {
  liquidityPoolContracts: LiquidityPoolContract[]
}
