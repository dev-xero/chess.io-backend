# Build stage
# FROM node:18-alpine AS build
# WORKDIR /app

# COPY package.json pnpm-lock.yaml ./
# RUN npx pnpm install

# COPY . .
# RUN npx prisma generate
# RUN npx pnpm run build

# # Prod stage
# FROM node:18-alpine
# WORKDIR /app

# COPY --from=build /app/build ./build
# COPY package.json yarn.lock ./
# COPY --from=build /app/prisma ./prisma

# RUN yarn install --production --frozen-lockfile
# RUN yarn prisma migrate deploy

# EXPOSE 8000
# CMD ["node", "--experimental-specifier-resolution=node", "build/server.js"]

FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

EXPOSE 8080
CMD [ "pnpm", "start:prod" ]
