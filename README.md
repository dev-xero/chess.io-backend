# Chess.io Backend

This repository contains code that powers chess.io's gameplay, user authentication, and analytics. It provides an API web clients can use to perform these actions. Written in NodeJS with the ExpressJS framework, PostgreSQL for player data, and Redis for real-time game state.


## Technologies Used

1. NodeJS (Typescript) with Express framework.
2. PostgreSQL: primary database.
3. Redis: in-memory game store.
4. WebSockets Protocol: real-time low latency communication.
5. Docker: containerization.

## Configuration

To develop / test the endpoints locally, clone the repo then follow the steps outlined below.

```sh
git clone https://github.com/dev-xero/chess.io-backend.git chessio-backend
```

1. Rename .env.example to .env and fill in the fields with your own Postgres DB URI, Redis URI, JWT secret and remote url.
2. Generate the Prisma client by running `yarn prisma generate`.
3. Perform relevant db migrations by using the script: `migrations.sh`.
4. To run the server in a dev environment with full reloads, use `server.sh`.
5. To build the production code, use `yarn start:prod`.
6. To cleanup build files, use the `clean.sh` script.
