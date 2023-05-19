interface Condition {
  id: string
  conditionId: string
  wonOutcome: {
    outcomeId: string
  }
  core: {
    address: string
    liquidityPool: {
      address: string
    }
  }
}

interface Outcome {
  id: string
  outcomeId: string
  condition: Condition
}

interface Sport {
  name: string
}

interface Country {
  name: string
}

interface League {
  name: string
  country: Country
}

interface Participant {
  name: string
  image: string
}

interface Game {
  id: string
  sport: Sport
  league: League
  participants: Participant[]
  startsAt: string
}

export interface EventsData {
  games: Game[]
}

/**
 * getBetsHistory
 */

interface Bet {
  __typename: string
  id: string
  betId: string
  amount: string
  potentialPayout: string
  status: string
  isRedeemed: boolean
  odds: string
  createdAt: string
  txHash: string
  outcome: Outcome
  game: Game
}

export interface BetData {
  bets: Bet[]
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
