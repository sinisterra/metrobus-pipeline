const { gql } = require('apollo-server')

module.exports = gql`
  type MetrobusUnit {
    id: ID!
    label: Int!
    history: [MetrobusEvent!]!
  }

  type Alcaldia {
    name: String!
  }

  type MetrobusLocation {
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
    unitCount: Int!
    units: [MetrobusUnit!]!
    unit(id: ID!): MetrobusUnit
    alcaldias: [Alcaldia]!
    unitsInAlcaldia(alcaldia: String!): [MetrobusUnit!]!
  }
`
