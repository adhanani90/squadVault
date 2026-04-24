## Decisions

This document contains the decisions made during the development of SquadVault, including the rationale behind each decision and the trade-offs made.

### April 20, 2026

#### 1. Single multi-stage Docker build

I decided to use a single multi-stage Docker build for the application. Stage 1 builds the client and stage 2 runs the server and serves the dist via express.static.

I considered using two separate Dockerfiles, following the "one concern per container" principle. Decided against it because my architecture serves the React frontend from Express; splitting them would require the introduction of nginx as a reverse proxy, and the addition of cors. 

**Trade-off**: if the traffic increases, it would be a good idea to split the frontend and backend, which would necessaitate changes in the docker-compose.yml The current setup is acceptable for the current scope of the project. 

#### 2. DB script seperation

I decided to separate the DB script into two files: clearDB.js and populateDB.js. The clearDB.js file will drop the database and the populateDB.js file will create the database and populate it with data. This was done because the previous populateDB.js script dropped all the tables before reseeding the database, which made it unsafe as a deployment script; it would wipe all the date on every deployment. Now, running the populateDB.js script will only create te tables if they don't exist, and insert data only if it doesn't exist. 

**Trade-off**: an extra script to maintain, but it is safer, so I decided to go with it.

April 23, 2026

#### 3. New Route Added

Rather than creating a single standings route, I created a dedicated leagueRouter, mounted on the /leagues route. This makes the API the clear place to add league-related routes; begining with the standings route now, with a form table and fixture table in the future.

A standings route could have added, but I considered the future growth of the project, and it would not be ideal for the future growth. 

**Trade-off**: It did take a bit more time than just inserting the standings route, but it is a good idea to keep the API clean and organized, and will aid when AI is added, as the different routes will be easier to pull data from.