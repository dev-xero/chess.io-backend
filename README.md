<img src="./.github/assets/monochrome.svg" width="480px" />

# ChessIO Backend Server

This repository contains code that powers chess.io's gameplay, user authentication, and analytics. It provides an API web clients can use to perform these actions. Written in NodeJS with the ExpressJS framework, PostgreSQL for player data, and Redis for real-time game state.

## API Endpoints (Overview)

All endpoints aside from the base must be prefixed with `/v1` before requests are handled.

| Method | Endpoint | Requires Auth | Description |
|--------|-------------|-----------------|-------------|
| **GET** | `/` | False | Base endpoint. |
| **GET** | `/v1/health` | False | Health checks, returns a 200 if the server is up. |
| **POST** | `/v1/auth/register` | False | Registers a new user and generates an authentication token if successful. |
| **POST** | `/v1/auth/login` | False | Logs in a user after validating credentials, returns an authentication token. |
| **POST** | `/v1/auth/reset-password` | False | Resets user password after verifying username and secret question. |
| **POST** | `/v1/auth/logout` | True | Attempts to log a user out after verifying their authorization token. Denies the request if the token is invalid / blacklisted. |
| **POST** | `/v1/challenge/create` | True | Creates a pending chess challenge, expires in 30 mins if unused. |
| **POST** | `/v1/challenge/accept/:id` | True | Accepts and assigns the opponent to the challenge specified by the id. |
| **GET** | `/v1/game/state/:id` | True | Returns a payload containing the current game position and other metadata. |
| **POST** | `/v1/game/move/:id` | True | Processes a chess move and returns board result. |

## Technologies Used

1. NodeJS (Typescript) with Express framework.
2. PostgreSQL.
3. Redis.
4. Web sockets.
5. Docker.
6. AWS ECR and App Runner.

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
