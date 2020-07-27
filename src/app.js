require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV } = require('./config');
const articlesRouter = require('./articles/articles-router');
const usersRouter = require('./users/users-router');
const errorHandler = require('./error-handler');

const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// For XSS Sanitation Demo Purposes ////////////////////////////////
app.get('/xss', (req, res) => {
    res.cookie('secretToken', '1234567890');
    res.sendFile(__dirname + '/xss-example.html')
});
// ^^ to simulate a Cross-site scripting (XSS) hack! 
// src: https://courses.thinkful.com/node-postgres-v1/checkpoint/16#cross-site-scripting-xss-
// Typically one would remove this /xss route 
// and the xss-example.html once finished, 
// but I'll keep it for learning purposes.

app.use(errorHandler);

module.exports = app;