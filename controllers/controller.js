const { selectAllTopics } = require('../models/model')

exports.getAllTopics = (req, res, next) => {
    console.log('before model')
    selectAllTopics()
    .then((topics) => {
        res.status(200).send(topics)
    })
}