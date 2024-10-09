<img src="./.github/assets/monochrome.svg" width="480px" />

# ChessIO Backend Server

This repository contains code that powers chess.io's gameplay, user authentication, and analytics. It provides an API web clients can use to perform these actions. Written in NodeJS with the ExpressJS framework, PostgreSQL for player data, and Redis for real-time game state.

## API Endpoints (Overview)

All endpoints aside from the base must be prefixed with `/v1` before requests are handled.

1. **GET** `/` - Base endpoint.
2. **GET** `/v1/health` - Health checks, returns a 200 if the server is up.
3. **POST** `/v1/auth/register` - Registers a new user and generates an authentication token if successful.
4. **POST** `/v1/auth/login` - Logs in a user after validating credentials, returns an authentication token.
5. **POST** `/v1/auth/logout` (Requires Bearer) - Attempts to log a user out after verifying their authorization token. Denies the request if the token is invalid / blacklisted.
6. **POST** `/v1/challenge/create` (Requires Bearer) - Creates a pending chess challenge, expires in 30 mins if unused.
7. **POST** `/v1/challenge/accept/:id` (Requires Bearer) - Accepts and assigns the opponent to the challenge specified by the id.

## Configuration

To develop / test the endpoints locally, clone the repo then follow the steps outlined below.

```sh
git clone https://github.com/dev-xero/chess.io-backend.git chess-backend
```

1. Rename .env.example to .env and fill in the fields with your own Postgres DB URI, Redis URI, JWT secret and remote url.
2. Generate the Prisma client by running `yarn prisma generate`.
3. Perform relevant db migrations by using the script: `migrations.sh`.
4. To run the server in a dev environment with full reloads, use `server.sh`.
5. To build the production code, use `yarn start:prod`.
6. To cleanup build files, use the `clean.sh` script.
