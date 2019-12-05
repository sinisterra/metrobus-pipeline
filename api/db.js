const { MongoClient } = require('mongodb')

const client = new MongoClient(
  'mongodb://metrobusetl:Sandb0x@ds153566.mlab.com:53566/metrobus_etl',
  { useUnifiedTopology: true }
)

module.exports = client
