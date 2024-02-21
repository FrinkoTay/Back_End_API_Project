const articlesRouter = require('express').Router()
const { getArticle, getAllArticles, getArticleComments, patchArticle } = require('../controllers/articles-controller')

articlesRouter
    .route('/')
    .get(getAllArticles)

articlesRouter
    .route('/:article_id')
    .get(getArticle)
    .patch(patchArticle)

articlesRouter
    .route('/:article_id/comments')
    .get(getArticleComments)

module.exports = articlesRouter