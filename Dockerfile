# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn prisma generate
RUN yarn build

# Prod stage
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/build ./build
COPY package.json yarn.lock ./
COPY --from=build /app/prisma ./prisma
# COPY .env.production .env

ARG PORT
ARG NODE_ENV
ARG PG_DATABASE_URL
ARG JWT_SECRET

RUN touch .env
RUN echo "PORT=${PORT:-8000}" >> .env
RUN echo "NODE_ENV=${NODE_ENV:-production}" >> .env
RUN echo "PG_DATABASE_URL=${PG_DATABASE_URL}" >> .env
RUN echo "JWT_SECRET=${JWT_SECRET}" >> .env

# RUN cat .env

RUN yarn install --production --frozen-lockfile
RUN yarn prisma migrate deploy

EXPOSE 8000
CMD ["node", "--experimental-specifier-resolution=node", "build/server.js"]
