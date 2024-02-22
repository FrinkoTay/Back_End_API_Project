const { removeComment } = require('../models/comments-model')

exports.deleteComment = (req, res, next) => {
    return removeComment(req.params)
    .then(() => {
        res.status(204).send()
    })
    .catch(next)
}