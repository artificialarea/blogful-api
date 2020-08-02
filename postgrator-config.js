require('dotenv').config();

module.exports = {
    "migrationsDirectory": "migrations",
    "driver": "pg",
    "ssl": !!process.env.SSL,   // ThinkChat addition
    "connectionString": (process.env.NODE_ENV == 'test')
        ? process.env.TEST_DATABASE_URL
        : process.env.DATABASE_URL
}


/* RE: CRUCIAL UPDATE! commit 

Followed instructions for Deploying database 
per: https://courses.thinkful.com/node-postgres-v1/checkpoint/20 
but reached an impasse when trying to run migrations on heroku-postresql

$ npm run migrate:production
kept fialing at the blogful-api migrate script
postgrator --config postgrator-config.js "not found"

Thanks to a long troubleshooting session with Jonathan Huxhold @ ThinkfulChat
issue eventually solved.

Several changes were made to .env, package.json, config.js, and postgrator-config.js
so I'm not sure which particular change (or combination of changes) was 
the deciding factor.

The last change made for migration to work was done in this postgrator-config,
by adding "ssl": !!process.env.SSL

Jonathan says, 
"I think postgrator does something under the hood to accommodate ssl settings 
on db up in the environment. 
The double bang (!!) casts a truthy or falsy value to a boolean true or false. 
So by adding it as an actual postgrator config value, it was able to establish the connection."

other alteration in packgage.json "scripts"...
from originally to:
"migrate:production": "heroku run npm run migrate"
to ThinkChat suggestion:
"migrate:production": "env SSL=true NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"
.
opted to revert back to original after migration done
*/