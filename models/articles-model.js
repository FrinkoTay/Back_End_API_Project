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

exports.affixArticleComment = (articleId, post) => {
    return db.query(`
        INSERT INTO comments
            (author, body, article_id)
        VALUES
            ($1, $2, $3)
        RETURNING *
    ;`, [post.username, post.body, articleId]
    )
    .then((response) => {
        return response.rows
    })
}