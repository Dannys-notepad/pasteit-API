const mySql2 = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}

const db = mySql2.createPool(dbConfig)

module.exports = db