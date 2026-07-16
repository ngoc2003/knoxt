# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.18.0
ARG PNPM_VERSION=11.13.1

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile --filter api...

FROM dependencies AS migrator
COPY packages/database packages/database

FROM migrator AS migration-runner
USER node
CMD ["pnpm", "--filter", "database", "db:migrate:deploy"]

FROM migrator AS builder
COPY apps/api apps/api
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build pnpm --filter database generate
RUN pnpm --filter api build
RUN find apps/api/dist -type f \( -name "*.d.ts" -o -name "*.js.map" -o -name "*.tsbuildinfo" \) -delete
RUN pnpm --filter api --prod deploy --legacy /prod/api

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
# Keep the runtime OS packages patched. npm and Corepack are only needed by the
# build stages; removing them also avoids shipping their unused dependency tree.
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder --chown=node:node /prod/api ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
