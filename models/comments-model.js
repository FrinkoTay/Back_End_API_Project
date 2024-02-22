const db = require('../db/connection')

exports.removeComment = (parameters) => {
    return db.query(`
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *
    ;`, [parameters.comment_id])
    .then((deletedRows) => {
        if (deletedRows.rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: 'comment does not exist'
            })
        }
        return
    })
}