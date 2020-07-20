const knex = require('knex')
const app = require('../src/app');
const fixtures = require('./articles.fixtures')
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
            const testArticles = fixtures.makeArticlesArray()
    
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

    describe.only('GET /articles/:article_id', () => {

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
                    .get(`/articles/${articleId}`)
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
                    .get(`/articles/${maliciousArticle.id}`)
                    .expect(200)
                    .expect(res => {
                        console.log('Thanks to xss sanitization, the insertion of malicious code from a POST is rendered inert upon GET: ', res.body.title, res.body.content);
                        expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;') // converts script to render it inert
                        expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`) // onerror="alert(document.cookie);" gets removed
                    })
            });
        })

        context(`Given the database is empty`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .get(`/articles/123456`)
                    .expect(404, { error: { message: `Article doesn't exist` } })
            });
        });

    });

    describe(`POST /articles`, () => {

        it(`creates an article, responding with 201 and the new article`, function() {
            this.retries(3);    // repeats test to ensure that actual and expected date_published timestamps match
            const newArticle = {
                title: 'Test new article',
                style: 'Listicle',
                content: 'Test new article content...'
            };
            return supertest(app)
                .post('/articles')
                .send(newArticle)
                .expect(201)
                .expect(res => {    // test still passes without testing db...
                    expect(res.body.title).to.eql(newArticle.title)
                    expect(res.body.style).to.eql(newArticle.style)
                    expect(res.body.content).to.eql(newArticle.content)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/articles/${res.body.id}`)
                    const expected = new Date().toLocaleString()    // to strip out milleseconds mismatch
                    const actual = new Date(res.body.date_published).toLocaleString()   
                    expect(actual).to.eql(expected)
                })
                .then(postRes => {  // ...so, GET /articles/:article_id to validate that the POST adds article to db
                    return supertest(app)
                        .get(`/articles/${postRes.body.id}`)
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
                    .post('/articles')
                    .send(newArticle)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            });
        });

    });

});