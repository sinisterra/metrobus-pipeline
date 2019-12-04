const { ApolloServer, gql } = require('apollo-server')
const resolvers = require('./resolvers')

const typeDefs = gql`
  type MetrobusUnit {
    id: ID!
    label: Int!
    history: [MetrobusEvent!]!
  }

  type Alcaldia {
    name: String!
  }

  type MetrobusLocation {
    lat: String!
    lon: String!
    alcaldia: Alcaldia!
  }

  type MetrobusEvent {
    unit: MetrobusUnit!
    location: MetrobusLocation!
    timestamp: String!
  }

  type Query {
    hello: String!
    events: [MetrobusEvent!]!
    units: [MetrobusUnit!]!
    unit(id: ID!): MetrobusUnit
    alcaldias: [Alcaldia]!
    unitsInAlcaldia(alcaldia: String!): [MetrobusUnit!]!
  }
`

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`Ready at ${url}`)
})
