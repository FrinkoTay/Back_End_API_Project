const express = require('express')
const apiRouter = require('./routers/api-router')

const app = express()

app.use(express.json())

app.use('/api', apiRouter)

// error handling

app.use('*', (req, res) => {
    res.status(404).send({ msg: "Route does not exist"})
})

module.exports = app