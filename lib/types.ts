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
