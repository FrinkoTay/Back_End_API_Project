exports.sortArticlesByCommentCount = (articles, direction) => {
    if (direction === 'asc') {
        return articles.sort((article1, article2) => {
            return article1.comment_count - article2.comment_count
        })
    } else {
        return articles.sort((article1, article2) => {
            return article2.comment_count - article1.comment_count
        })
    }
}