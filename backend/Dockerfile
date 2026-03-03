FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma/

RUN pnpm prisma generate

COPY . .

RUN pnpm tsc-alias && pnpm tsc

EXPOSE 8080

CMD ["node", "build/server.js"]
