const articlesRouter = require('express').Router()
const { getArticle, getAllArticles, getArticleComments, postArticleComment } = require('../controllers/articles-controller')

articlesRouter
    .route('/')
    .get(getAllArticles)

articlesRouter
    .route('/:article_id')
    .get(getArticle)

articlesRouter
    .route('/:article_id/comments')
    .get(getArticleComments)
    .post(postArticleComment)

module.exports = articlesRouter