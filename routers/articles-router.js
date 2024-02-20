const articlesRouter = require('express').Router()
const { getArticle, getAllArticles } = require('../controllers/articles-controller')

articlesRouter
    .route('/')
    .get(getAllArticles)

articlesRouter
    .route('/:article_id')
    .get(getArticle)

module.exports = articlesRouter