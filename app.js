require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const PORT = 8000
const apiRoutes = require('./src/routes/api.route')

app.use(express.json())
app.use(express.urlencoded({ extended:false }))
app.use('/api/v1/paste', apiRoutes)

app.listen(PORT, () => console.log(`Server up and run on port ${PORT}`))