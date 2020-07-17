# Express Boilerplate!

This is a boilerplate project used for starting new projects, per [Thinkful's instructions](https://courses.thinkful.com/node-postgres-v1/checkpoint/8).

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. `git clone BOILERPLATE-URL NEW-PROJECTS-NAME && cd $_` to clone this repository to your local machine and change directory. 
2. `rm -rf .git && git init` to make a fresh start of the git history for this project with. Then `git remote -v` to confirm.
3. `npm install` to install all node dependencies 
4. `mv example.env .env` to move/rename the `example.env` Environment file to `.env` that will be ignored by git and read by the express server. 
5. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
