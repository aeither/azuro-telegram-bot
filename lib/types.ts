export interface BetData {
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
  outcome: object
  game: object
}
