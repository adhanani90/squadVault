[![SquadVault CI](https://github.com/adhanani90/squadVault/actions/workflows/tests.yml/badge.svg)](https://github.com/adhanani90/squadVault/actions/workflows/tests.yml)

## Summary

SquadVault is a football club management system for tracking clubs, players, and rosters. It features JWT-authenticated CRUD operations and a CI pipeline with automated integration tests.

Live demo: https://squadvault-production.up.railway.app/

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- EJS
- Jest
- Supertest

## Installation

1. Clone the repository and install dependencies:
```bash
   git clone https://github.com/adhanani90/squadVault.git
   cd squadVault
   npm install
```

2. Create a `.env` file in the root directory and configure your PostgreSQL connection:
```
   DB_USER=your_database_user
   DB_HOST=your_database_host
   DB_NAME=your_database_name
   DB_PASSWORD=your_database_password
   DB_PORT=5432
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
```

3. Start the server:
```bash
   npm start
```

4. Navigate to `http://localhost:3000`

To run the test suite:
```bash
npm test
```

## Database Schema

**clubs** — `id, name, country, stadium`

**players** — `id, first_name, last_name, nationality, position, date_of_birth, club_id`

**users** — `id, email, password, age, bio`

## Relationships

Clubs have a one-to-many relationship with players via the `club_id` foreign key. A player belongs to one club at a time.

## Improvements

The app currently uses EJS server-side templating. A React frontend is planned as the next major iteration, which will include:

- Search and filtering on clubs and players
- Player transfer functionality with transfer history
- User profile pages
- Docker support for consistent deployment across environments