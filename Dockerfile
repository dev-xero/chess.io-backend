# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Prod stage
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/build ./build
COPY package.json yarn.lock ./
COPY --from=build /app/prisma ./prisma
COPY .env.production .env

RUN yarn install --production --frozen-lockfile
RUN yarn prisma migrate deploy

EXPOSE 8080
CMD ["node", "--experimental-specifier-resolution=node", "build/server.js"]
