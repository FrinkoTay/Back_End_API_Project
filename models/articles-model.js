const db = require('../db/connection')

exports.selectArticle = (articleId) => {
    return db.query(`
        SELECT * FROM articles
        WHERE article_id = $1
    `, [articleId])
    .then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: 'article does not exist'
            })
        }
        return response.rows
    })
}

exports.selectArticleComments = (articleId) => {
    return db.query(`
        SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC
    ;`, [articleId])
    .then((response) => {
        return response.rows
    })
}

exports.selectAllArticles = () => {
    let queryStr = 'SELECT * FROM articles'
    queryStr += ' ORDER BY created_at'
    queryStr += ' DESC'
    return db.query(queryStr)
    .then((response) => {
        return response.rows
    })
}

exports.countComments = () => {
    return db.query(`SELECT article_id FROM comments`)
    .then((comments) => {
        const commentCount = {}
        comments.rows.forEach((comment) => {
            if (commentCount[comment.article_id]) {
                commentCount[comment.article_id] += 1
            } else {
                commentCount[comment.article_id] = 1
            }
        })
        return commentCount
    })
}

exports.addArticleVotes = (articleId, patchBody) => {
    return db.query(`
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *
    ;`, [patchBody.inc_votes, articleId])
    .then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: 'article does not exist'
            })
        }
        return response.rows
    })
}