const articlesRouter = require('express').Router()
const { getArticle, getArticleComments } = require('../controllers/articles-controller')

articlesRouter
    .route('/:article_id')
    .get(getArticle)

articlesRouter
    .route('/:article_id/comments')
    .get(getArticleComments)

module.exports = articlesRouter