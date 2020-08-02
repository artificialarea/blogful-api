require('dotenv').config();

module.exports = {
    "migrationsDirectory": "migrations",
    "driver": "pg",
    "ssl": !!process.env.SSL,   // CRUCIAL! See README for details as to why
    "connectionString": (process.env.NODE_ENV == 'test')
        ? process.env.TEST_DATABASE_URL
        : process.env.DATABASE_URL
}
