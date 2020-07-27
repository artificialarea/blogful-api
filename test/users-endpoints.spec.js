const knex = require('knex');
const app = require('../src/app.js');
const { makeArticlesArray } = require('./articles.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const supertest = require('supertest');

describe.skip(`Users Endpoints`, () => {

    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('blogful_users').truncate());
    afterEach('cleanup', () => db('blogful_users').truncate());

    describe(`GET /api/users`, () => {
        
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, [])
            });
        });

        context(`Given there are users in the database`, () => {

            const testUsers = makeUsersArray();
            
            beforeEach(`insert users into db`, () => {
                return db
                    .into('blogful_users')
                    .insert(testUsers)
             })


            it(`responds with 200 and returns list of users`, () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsers)
            
            });
        })
    });


});