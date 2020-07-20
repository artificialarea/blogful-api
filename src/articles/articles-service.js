// ARTICLES SERVICE OBJECT EXERCISE ////////////////////////////////////////////
// initial src: https://courses.thinkful.com/node-postgres-v1/checkpoint/14

const ArticlesService = {

    // DEPENDENCY INJECTION
    // knex db is being injected into these fns as a param

    getAllArticles(knex) { 
        return knex.select('*').from('blogful_articles')
    },
    getById(knex, id) {
        return knex
            .from('blogful_articles')
            .select('*')
            .where('id', id)
            .first()
    },
    insertArticle(knex, newArticle) {
        // return Promise.resolve({})
        return knex
            .insert(newArticle)
            .into('blogful_articles')
            .returning('*')
            .then(rows => rows[0])
            // ^^^ .then to extract the expected object out of the array.
    },
    deleteArticle(knex, id) {
        // console.log('deleteArticle id: ', {id})
        return knex
            .from('blogful_articles')
            .where({ id })
            .delete()
            // .then(
            //     console.log('required?')
            // )
            // ^^^^ Why .then() ? 
            // See FOOTNOTES in earlier repo: https://github.com/artificialarea/knex-practice/blob/master/src/blogful.js
    },
    updateArticle(knex, id, newArticleFields) {
        return knex
            .from('blogful_articles')
            .where({ id })
            .update(newArticleFields)
    },

};

module.exports = ArticlesService;