const { selectAllTopics } = require('../models/topics-model')

exports.getAllTopics = (req, res, next) => {
    selectAllTopics()
    .then((topics) => {
        res.status(200).send(topics)
    })
}
