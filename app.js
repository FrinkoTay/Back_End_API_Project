const express = require('express')
const apiRouter = require('./routers/api-router')

const app = express()


app.use(express.json())

app.use('/api', apiRouter)


// error handling

app.use('*', (req, res) => {
    res.status(404).send({ msg: "Route does not exist"})
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg })
    } else { next(err) }
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
      res.status(400).send({ msg: "Bad request"})
    } else { next(err) }
  })

module.exports = app