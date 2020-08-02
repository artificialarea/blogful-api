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

