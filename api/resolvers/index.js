const client = require('../db')

const alcaldias = (root, context, args) => {
  return new Promise((resolve, reject) => {
    client.connect().then(() => {
      client
        .db('metrobus_etl')
        .collection('alcaldias')
        .find({}, { loc: false })
        .toArray((err, result) => {
          if (err) throw err
          resolve(result)
        })
    })
  })
}

const MetrobusUnit = {
  history(root, args, context, info) {
    return new Promise((resolve, reject) => {
      client.connect().then(() => {
        const { id } = root
        client
          .db('metrobus_etl')
          .collection('events')
          .find({ 'unit._id': id })
          .toArray((err, result) => {
            if (err) throw err

            if (result.length > 0) {
              resolve(result)
            }
          })
      })
    })
  }
}

module.exports = {
  Query: {
    hello: () => 'Hello, world!',
    unitCount: () => {
      return new Promise((resolve, reject) => {
        client.connect().then(() => {
          client
            .db('metrobus_etl')
            .collection('events')
            .aggregate([{ $group: { _id: '$unit._id', count: { $sum: 1 } } }])
            .toArray((err, result) => {
              if (err) throw err
              resolve(result.length)
            })
        })
      })
    },
    units: () => {
      return new Promise((resolve, reject) => {
        client.connect().then(() => {
          client
            .db('metrobus_etl')
            .collection('events')
            .aggregate([
              { $group: { _id: '$unit._id', entry: { $addToSet: '$unit' } } }
            ])
            .toArray((err, result) => {
              if (err) throw err
              resolve(
                result.map(({ _id: id, ...fields }) => ({ ...fields, id }))
              )
            })
        })
      })
    },
    unitsInAlcaldia: (_, { alcaldia }) => {
      return new Promise((resolve, reject) => {
        client.connect().then(() => {
          client
            .db('metrobus_etl')
            .collection('events')
            .aggregate([
              {
                $match: {
                  'location.alcaldia.name': alcaldia
                }
              },
              {
                $group: {
                  _id: '$location.alcaldia.name',
                  units: { $addToSet: '$unit' }
                }
              }
            ])
            .toArray((err, result) => {
              if (err) throw err
              if (result.length <= 0) {
                resolve([])
              } else {
                resolve(
                  result[0].units.map(({ _id, ...fields }) => ({
                    ...fields,
                    id: _id
                  }))
                )
              }
            })
        })
      })
    },
    unit: (_, { id }) => {
      return new Promise((resolve, reject) => {
        client.connect().then(() => {
          client
            .db('metrobus_etl')
            .collection('events')
            .aggregate([
              { $match: { 'unit._id': String(id) } },
              { $group: { _id: '$unit._id', entry: { $addToSet: '$unit' } } }
            ])
            .toArray((err, result) => {
              if (err) throw err
              entry = result[0].entry[0]
              entry.id = entry._id
              resolve(entry)
            })
        })
      })
    },
    alcaldias
  },
  MetrobusUnit
}
