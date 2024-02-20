const { getArticle } = require('../models/articles-model')

exports.getArticle = (req, res, next) => {
    const articleId = req.params.article_id
    getArticle(articleId)
    .then((response) => {
        res.status(200).send(response[0])
    })
    .catch(next)
}