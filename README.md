# Blogful API

## Sequence 

1. **Databases with Express** https://courses.thinkful.com/node-postgres-v1/checkpoint/15
2. **POST and DELETE with PostgreSQL** https://courses.thinkful.com/node-postgres-v1/checkpoint/16
    * **[Thinkful solution...](https://github.com/Thinkful-Ed/blogful-api/tree/delete-article)**
3. **PATCH (and RESTful API)** https://courses.thinkful.com/node-postgres-v1/checkpoint/17
    * **[Thinkful solution...](https://github.com/Thinkful-Ed/blogful-api/tree/implement-patch-articles-endpoint)**
4. **Add Relationships** https://courses.thinkful.com/node-postgres-v1/checkpoint/19
5. **Deploying Database (on Heroku)** https://courses.thinkful.com/node-postgres-v1/checkpoint/20

<br /> 

## CRUCIAL UPDATE! commit 

Although I carefully following instructions for deploying database per https://courses.thinkful.com/node-postgres-v1/checkpoint/20 ... I reached an impasse at the stage of trying to run migrations on the heroku-postresql.

**`$ npm run migrate:production`** kept failing at the `blogful-api migrate script` re: `postgrator --config postgrator-config.js` "not found".

Thanks to a long troubleshooting session with Jonathan Huxhold @ ThinkfulChat, the issue ws eventually solved.

Several changes were made to `.env, package.json, config.js, and postgrator-config.js` so I'm uncertain which particular change (or combination of changes) was the deciding factor. That said, the last change made for migration to work was done the `postgrator-config.js` by adding `"ssl": !!process.env.SSL` to the module.export properties.

Jonathan said, 
"I think postgrator does something under the hood to accommodate ssl settings on db up in the environment. The double bang (!!) casts a truthy or falsy value to a boolean true or false. So by adding it as an actual postgrator config value, it was able to establish the connection."

### Other alterations 

**1) in `packgage.json "scripts"`**

originally:
`"migrate:production": "heroku run npm run migrate"`

per ThinkChat suggestion changed to:
`"migrate:production": "env SSL=true NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"`

I subsequently tried to revert back to the original after initial migration done but migrate:production failed again, so returning to the convoluted command with SSL.

**2) in `config.js`**

originally:
`DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin@localhost/blogful'`

changed to:
`DATABASE_URL: process.env.DATABASE_URL || /* heroku URI */` ... which isn't a valid solution because my PostgreSQL URI is exposed, but fine in this particular scenario as api ain't a paid service.

