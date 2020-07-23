const knex = require('knex')
const app = require('../src/app');
const fixtures = require('./articles.fixtures')
const supertest = require('supertest');
const { expect } = require('chai');
const { makeArticlesArray } = require('./articles.fixtures');

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

    describe('GET /api/articles', () => {

        context('Given no articles', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/articles')
                    .expect(200, [])
            });
        });

        context('Given there are articles in the database', () => {
            const testArticles = fixtures.makeArticlesArray();
    
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            });
    
            it('responds with 200 and all of the articles', () => {
                return supertest(app)
                    .get('/api/articles')
                    .expect(200, testArticles)
            });
        });

    });

    describe('GET /api/articles/:article_id', () => {

        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .get(`/api/articles/123456`)
                    .expect(404, { error: { message: `Article doesn't exist` } })
            });
        });

        context('Given there are articles in the database', () => {
            const testArticles = fixtures.makeArticlesArray()
    
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            });
    
            it('responds with 200 and the specified article', () => {
                const articleId = 2;
                const expectedArticle = testArticles[articleId - 1]
                return supertest(app)
                    .get(`/api/articles/${articleId}`)
                    .expect(200, expectedArticle)
            })
        });

        // XSS Sanitation to protect from malicious hacks
        // (requires npm install xss)
        context(`Given an XSS attack article`, () => {

            const maliciousArticle = {
                id: 911,
                title: 'Naughty naughty very naughty <script>alert("xss");</script>',
                style: 'How-to',
                content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
            };

            beforeEach('insert malicious article', () => {
                return db 
                    .into('blogful_articles')
                    .insert([ maliciousArticle ])
            });

            it('removed XSS attack content', () => {
                return supertest(app)
                    .get(`/api/articles/${maliciousArticle.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;') // converts script to render it inert
                        expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`) // onerror="alert(document.cookie);" gets removed
                    })
            });
        })

        

    });

    describe(`POST /api/articles`, () => {

        it(`creates an article, responding with 201 and the new article`, function() {
            this.retries(3);    // repeats test to ensure that actual and expected date_published timestamps match
            const newArticle = {
                title: 'Test new article',
                style: 'Listicle',
                content: 'Test new article content...'
            };
            return supertest(app)
                .post('/api/articles/')
                .send(newArticle)
                .expect(201)
                .expect(res => {    // test still passes without testing db...
                    expect(res.body.title).to.eql(newArticle.title)
                    expect(res.body.style).to.eql(newArticle.style)
                    expect(res.body.content).to.eql(newArticle.content)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/articles/${res.body.id}`)
                    const expected = new Date().toLocaleString()    // to strip out milleseconds mismatch
                    const actual = new Date(res.body.date_published).toLocaleString()   
                    expect(actual).to.eql(expected)
                })
                .then(postRes => {  // ...so, GET /api/articles/:article_id to validate that the POST adds article to db
                    return supertest(app)
                        .get(`/api/articles/${postRes.body.id}`)
                        .expect(postRes.body)
                })
        });

        // DRY (don't repeat yourself) tests
        const requiredFields = ['title', 'style', 'content'];

        requiredFields.forEach(field => {
            const newArticle = {
                title: 'Test new article',
                style: 'Listicle',
                content: 'Test new article content...'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newArticle[field];

                return supertest(app)
                    .post('/api/articles')
                    .send(newArticle)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            });
        });

    });

    describe(`DELETE /api/articles/:article_id`, () => {

        context(`Given no articles`, () => {

            it(`responds with 404`, () => {
                const articleId = 123213123;
                return supertest(app)
                    .delete(`/api/articles/${articleId}`)
                    .expect(404, { error: { message: `Article doesn't exist`} })
            });

        })

        context(`Given there are articles in the database`, () => {
            const testArticles = fixtures.makeArticlesArray();

            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            });

            it(`responds with 204 and removes the article`, () => {
                const idToDelete = 2;
                const expectedArticles = testArticles.filter(article => article.id !== idToDelete);
                return supertest(app) 
                    .delete(`/api/articles/${idToDelete}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/api/articles')
                            .expect(expectedArticles)
                    })
            });

        });

    });

    describe(`PATCH /api/articles/:article_id`, () => {
    
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const articleId = 123456;
                return supertest(app)
                    .patch(`/api/articles/${articleId}`)
                    .expect(404, { error: { message: `Article doesn't exist` } })
            });
        });

        context(`Given there are articles in the database`, () => {
            const testArticles = makeArticlesArray();

            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            })

            it(`responds with 204 and updates the article`, () => {
                const idToUpdate = 2;
                const updateArticle = {
                    title: 'Updated article title',
                    style: 'Interview',
                    content: 'Updated article content...'
                };
                const expectedArticle = {
                    ...testArticles[idToUpdate - 1],
                    ...updateArticle
                }
                return supertest(app)
                    .patch(`/api/articles/${idToUpdate}`)
                    .send(updateArticle)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/api/articles/${idToUpdate}`)
                            .expect(expectedArticle)
                    })
            });

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/articles/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'title', 'style' or 'content'`
                        }
                    })
            });
        });

    });

});