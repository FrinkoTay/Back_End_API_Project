const { selectEndpoints } = require('../models/api-model')

exports.getEndpoints = (req, res, next) => {
    return selectEndpoints()
        .then((response) => {
            const parsedResponse = JSON.parse(response)
            res.status(200).send(parsedResponse)
        })
}