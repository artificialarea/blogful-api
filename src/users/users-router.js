const path = require('path');
const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
    id: user.id,
    fullname: xss(user.fullname),
    username: xss(user.username),
    nickname: xss(user.nickname),
    date_created: user.date_created,
})  // why () => ({}) and not just () => {}? Because it's returning an object so {{...}} isn't kosher? 

usersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        UsersService.getAllUsers(knexInstance)
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { fullname, username, nickname, password } = req.body;
        const newUser = { fullname, username }; // only two fields required (NOT NULL) for validation

        // Validation
        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        // the other field properties then added to newUser object
        newUser.nickname = nickname;
        newUser.password = password;

        UsersService.insertUser(
            req.app.get('db'),
            newUser
        )
            .then(user => {
                res .status(204)
                    .location(path.posix.join(req.originalUrl + `/${user.id}`))
                    .json(serializeUser(user))
            })
            .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.user_id
        )
        .then(user => {
            if(!user) {
                return res.status(400).json({
                    error: { message: 'User doesn\'t exist' }
                })
            }
            res.user = user;     // to pass on user value as a response (res.user) to the next middleware
            next();
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeUser(res.user))
    })
    .delete((req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(numRowsAffected => {  
                console.log(numRowsAffected)  // WHAT IS 'numRowsAffected'? it's simply an anonymous function, no?
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { fullname, username, password, nickname } = req.body;
        const userToUpdate = { fullname, username, password, nickname };

        // Validation
        // Can't use approach like POST, because not all key values required. Soooooo
        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'fullname', 'username', 'password', or 'nickname'`
                }
                // *CONFUSED* Aren't two params required: fullname AND username ?!?!
            })

        // Re: filter(Boolean) above
        // Example:
        // var a = [1, 2, "b", 0, {}, "", NaN, 3, undefined, null, 5];
        // var b = a.filter(Boolean);  // [1, 2, "b", {}, 3, 5]; 
        // filters out anything in the object that isn't truthy: 0, "", NaN, undefined, null

        UsersService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = usersRouter;
