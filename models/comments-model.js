const db = require('../db/connection')

exports.removeComment = (parameters) => {
    return db.query(`
        DELETE FROM comments
        WHERE comment_id = $1
    ;`, [parameters.comment_id])
    .then(() => {
        return
    })
}