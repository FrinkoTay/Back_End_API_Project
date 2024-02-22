const { selectAllUsers } = require('../models/users-model')

exports.getAllUsers = (req, res, next) => {
    selectAllUsers()
    .then((users) => {
        res.status(200).send(users)
    })
}