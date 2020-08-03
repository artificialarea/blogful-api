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

Despite carefully following instructions for deploying database per https://courses.thinkful.com/node-postgres-v1/checkpoint/20 ... I reached an impasse at the stage of trying to run migrations on the heroku-postresql.

**`$ npm run migrate:production`** kept failing at the `blogful-api migrate script` =/

The error in full...
```
➜  blogful-api git:(master) npm run migrate:production
Running npm run migrate on ⬢ shielded-woodland-48221... up, run.9816 (Free)

> blogful-api@1.0.0 migrate /app
> postgrator --config postgrator-config.js

sh: 1: postgrator: not found
npm ERR! code ELIFECYCLE
npm ERR! syscall spawn
npm ERR! file sh
npm ERR! errno ENOENT
npm ERR! blogful-api@1.0.0 migrate: `postgrator --config postgrator-config.js`
npm ERR! spawn ENOENT
npm ERR! 
npm ERR! Failed at the blogful-api@1.0.0 migrate script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /app/.npm/_logs/2020-08-02T22_21_05_392Z-debug.log
➜  blogful-api git:(master)
```

<br />

Thanks to a long troubleshooting session with Jonathan Huxhold @ ThinkfulChat, the issue ws eventually resolved with the following alterations below...

### Alterations 

**1) `packgage.json "scripts"`**

* Originally:
`"migrate:production": "heroku run npm run migrate"`

* Update, per ThinkChat suggestion:
`"migrate:production": "env SSL=true NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"`

* I subsequently tried to revert back to the original after initial migration done but migrate:production failed again, so returning to the convoluted command with SSL.

**2) `postgrator-config.js`**

* Add `"ssl": !!process.env.SSL` to the `module.export` properties.

_Jonathan said, "I think postgrator does something under the hood to accommodate ssl settings on db up in the environment. The double bang (!!) casts a truthy or falsy value to a boolean true or false. So by adding it as an actual postgrator config value, it was able to establish the connection."_
