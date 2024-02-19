const apiRouter = require('express').Router()
const topicsRouter = require(`./topics-router`)
const { getEndpoints } = require('../controllers/api-controller')

apiRouter
    .route('/')
    .get(getEndpoints)

apiRouter.use('/topics', topicsRouter)

module.exports = apiRouter