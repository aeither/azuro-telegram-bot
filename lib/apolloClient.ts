import { ApolloClient, InMemoryCache } from 'https://esm.sh/@apollo/client@3.7.14'

/**
 * GraphQL
 */
const cache = new InMemoryCache()

export const client = new ApolloClient({
  cache,
  uri: 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-gnosis',
})
