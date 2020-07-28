const knex = require('knex');
const app = require('../src/app.js');
const { makeArticlesArray } = require('./articles.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const supertest = require('supertest');

describe(`Users Endpoints`, () => {

    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'))
    afterEach('cleanup',() => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'))

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
                const testUsersWithoutPasswords = testUsers.map(user => {
                    const { password, ...rest } = user;
                    return rest;
                })
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsersWithoutPasswords)
            
            });
        })
    });


});