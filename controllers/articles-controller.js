const { selectArticle, selectAllArticles, countComments, selectArticleComments, affixArticleComment, addArticleVotes } = require('../models/articles-model')

exports.getArticle = (req, res, next) => {
    const articleId = req.params.article_id
    selectArticle(articleId)
    .then((response) => {
        res.status(200).send(response[0])
    })
    .catch(next)
}


exports.getArticleComments = (req, res, next) => {
    const articleId = req.params.article_id
    Promise.all([selectArticleComments(articleId), selectArticle(articleId)])
    .then(([comments, article]) => {
        res.status(200).send(comments)
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

exports.postArticleComment = (req, res, next) => {
    selectArticle(req.params.article_id)
    .then(() => {
        return affixArticleComment(req.params.article_id, req.body)
    })
    .then((response) => {
        res.status(201).send(response)
    })
    .catch(next)
}

exports.patchArticle = (req, res, next) => {
    addArticleVotes(req.params.article_id, req.body)
    .then((response) => {
        res.status(200).send(response[0])
    })
    .catch(next)
}