# Northcoders News API

The /db/connection.js file references .env files in the .env-files folder that do not exist when first cloning this repo. 
'.env.test' and '.env.development' files must be added to this folder, pointing to the relevant databases for testing and development respectively.
These files will take the same format as the '.env-example' file, with 'database_name_here' replaced with the name of the corresponding database.
