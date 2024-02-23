# News API

### Project Description

This project is an API with the purpose of accessing database data. It aims to mimic the back-end of a news application like Reddit, and will provide this information to the front-end.

Here is a link to the hosted version: https://back-end-api-project-render.onrender.com

From this url, one can add any endpoint to request data. For a list of endpoints, use the endpoint '/api'.

### Setup

##### Cloning the repo

To clone the repo, run the command: `git clone https://github.com/FrinkoTay/Back_End_API_Project.git`

##### Installing dependencies

When in the repository, to install all dependencies, use the command: `npm install`

##### `.env` Files

The /db/connection.js file references .env files in the .env-files folder that do not exist when first cloning this repo. 
'.env.test' and '.env.development' files must be added to this folder, pointing to the relevant databases for testing and development respectively.
These files will take the same format as the '.env-example' file, with 'database_name_here' replaced with the name of the corresponding database.

##### Seeding local database

Note: seeding requires '.env.test' and '.env.development' files, so please make sure to follow the previous steps before seeding.

To seed the development database, use the command `npm run seed`.
The test database is seeded every time the test file is run, so does not require manual seeding.

### Testing

To run the test file, use the command `npm run test`.

### Minimum requirements

This project was created using Node v21.5.0 and psql 14.10 (Ubuntu 14.10-0ubuntu0.22.04.1).
It is therefore recommended to have Node and psql at versions at least this high.