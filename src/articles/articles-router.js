const path = require('path');
const express = require('express');
const xss = require('xss'); // sanitizes strings of content to prevent malicious hacks
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const jsonParser = express.json(); // to read body of requests (for POST)

// TODO: may use serializeArticle later as a DRY refactor
const serializeArticle = article => ({
    id: article.id,
    style: article.style,
    title: xss(article.title),
    content: xss(article.content),
    date_published: article.date_published,
})

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
    .post(jsonParser, (req, res, next) => {     // note the addition of jsonParser
        const { title, content, style } = req.body
        const newArticle = { title, content, style }

        // DRY (don't repeat yourself) validation logic
        for (const [key, value] of Object.entries(newArticle)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        ArticlesService.insertArticle(
            req.app.get('db'), 
            newArticle
        )
            .then(article => {
                res .status(201)
                    .location(path.posix.join(req.originalUrl, `/${article.id}`)) // re:posix and req.originalUrl, see details: https://courses.thinkful.com/node-postgres-v1/checkpoint/17#-api-prefix
                    .json(article)
            })
            .catch(next)
    })


articlesRouter
    .route('/:article_id')
    // DRY REFACTOR: .all() handler triggers for all .chained methods (GET, DELETE, etc...).
    .all((req, res, next) => {       
        ArticlesService.getById(
            req.app.get('db'), 
            req.params.article_id
        )    
            .then(article => {
                if (!article) {
                    return res.status(404).json({
                        error: { message: `Article doesn't exist` }
                    })
                }
                res.article = article // save the article for the next middleware
                next() // don't forget to call next so the next middleware happens! .get(), .delete(), etc.
            })
            .catch(next)
    })
    .get((req, res, next) => {
        // NOTE: modfication of 'article' object to 'res.article'
        res.json({
            id: res.article.id,
            style: res.article.style,
            title: xss(res.article.title),      // sanitize
            content: xss(res.article.content),  // sanitize
            date_published: res.article.date_published,
        })
    })
    .delete((req, res, next) => {
        ArticlesService.deleteArticle(
            req.app.get('db'),
            req.params.article_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, content, style } = req.body
        const updatedArticle = { title, content, style }

        ArticlesService.updateArticle(
            req.app.get('db'),
            req.params.article_id,
            updatedArticle
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next)
    })


module.exports = articlesRouter;