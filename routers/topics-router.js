const topicsRouter = require('express').Router()
const { getAllTopics } = require('../controllers/controller')

topicsRouter
    .route('/')
    .get(getAllTopics)

module.exports = topicsRouter