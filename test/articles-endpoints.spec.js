const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app');
const { makeArticlesArray } = require('./articles.fixtures')
const supertest = require('supertest');

describe('Articles Endpoints', () => {

    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db) /* CRUCIAL! b/c tests skip ./src/server.js file */
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('blogful_articles').truncate());
    afterEach('cleanup', () => db('blogful_articles').truncate());

    describe('GET /articles', () => {

        context('Given there are articles in the database', () => {
            const testArticles = makeArticlesArray()
    
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            });
    
            it('responds with 200 and all of the articles', () => {
                return supertest(app)
                    .get('/articles')
                    .expect(200, testArticles)
            });
        });

        context('Given the database is empty', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/articles')
                    .expect(200, [])
            });
        });

    });

    describe('GET /articles/:article_id', () => {

        context('Given there are articles in the database', () => {
            const testArticles = makeArticlesArray()
    
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            });
    
            it('responds with 200 and the specified article', () => {
                const articleId = 2;
                const expectedArticle = testArticles[articleId - 1]
                return supertest(app)
                    .get(`/articles/${articleId}`)
                    .expect(200, expectedArticle)
            })
        });

        context(`Given the database is empty`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .get(`/articles/123456`)
                    .expect(404, { error: { message: `Article doesn't exist` } })
            });
        });

    });

});