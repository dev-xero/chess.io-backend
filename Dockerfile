FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN apt-get update -y && apt-get install -y openssl
RUN corepack enable

WORKDIR /app

# -- Dependencies Stage
FROM base AS deps

COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# -- Build Stage
FROM deps AS build

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm exec prisma generate

RUN pnpm exec tsc && pnpm exec tsc-alias

# -- Prod Dependencies Stage
FROM base AS prod-deps
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# -- Final Stage
FROM node:20-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build

EXPOSE 8080
CMD ["node", "build/server.js"]
