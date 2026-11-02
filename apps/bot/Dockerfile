FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/bot/package.json ./apps/bot/

RUN npm install --no-audit --no-fund

# Copy code
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY apps/bot ./apps/bot

# Build shared & db
RUN npm run --prefix packages/shared build
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npm run --prefix packages/db build
RUN npm run --prefix apps/bot build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/bot ./apps/bot

CMD ["node", "apps/bot/dist/index.js"]
