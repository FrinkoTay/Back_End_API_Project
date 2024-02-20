const { selectArticle, selectAllArticles, countComments } = require('../models/articles-model')

exports.getArticle = (req, res, next) => {
    const articleId = req.params.article_id
    selectArticle(articleId)
    .then((response) => {
        res.status(200).send(response[0])
    })
    .catch(next)
}

exports.getAllArticles = (req, res, next) => {
    Promise.all([selectAllArticles(), countComments()])
    .then(([articles, comments]) => {
        articles.forEach((article) => {
            delete article.body
            if (article.article_id in comments) {
                article.comment_count = comments[article.article_id]
            } else {
                article.comment_count = 0
            }
        })
        res.status(200).send(articles)
    })
}