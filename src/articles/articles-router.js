const express = require('express');
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const jsonParser = express.json(); // to read body of requests (for POST)

articlesRouter
    .route('/')
    .get((req, res, next) => {
        // In order for this method to work 
        // we need to access the Knex instance req.app.get('db')
        // but avoid establishing a dependency cycle.
        // This can be achieved via a app.set() method in ./server.js (line 11),
        // with a db property set and the Knex instance set as the value.
        ArticlesService.getAllArticles(req.app.get('db'))
            .then(articles => {
                res.json(articles)
            })
            .catch(next) // Note we're passing next into the .catch from the promise chain so that any errors get handled by our error handler middleware.
    })
    .post(jsonParser, (req, res, next) => {
        const { title, content, style } = req.body
        const newArticle = { title, content, style }
        ArticlesService.insertArticle(
            req.app.get('db'), 
            newArticle
        )
            .then(article => {
                res .status(201)
                    .location(`/articles/${article.id}`)
                    .json(article)
            })
            .catch(next)
    })


articlesRouter
    .route('/:article_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        ArticlesService.getById(knexInstance, req.params.article_id)
            .then(article => {
                if (!article) {
                    return res.status(404).json({
                        error: { message: `Article doesn't exist` }
                    })
                }
                res.json(article)
            })
            .catch(next)
    })



module.exports = articlesRouter;