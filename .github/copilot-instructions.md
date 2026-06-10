# Project: Knoxt.io

## Monorepo Rules

- Shared types must be in packages/shared
- Do not duplicate DTO between frontend and backend

## Tech Stack

- NestJS (GraphQL code-first)
- Reactjs
- Prisma + PostgreSQL
- Monorepo (Turborepo)

## Rules

- Always use TypeScript strict mode
- Use GraphQL (no REST unless needed)
- Backend must handle business logic (tax calculation)
- Frontend must not call external APIs directly

## Code Style

- Clean architecture
- Use services for logic
- Reusable DTOs in shared package

## Naming

- Resolver: \*.resolver.ts
- Service: \*.service.ts
- Model: \*.model.ts

## For web

- Reactjs
- Use signals (no RxJS unless needed)
- Apollo client for GraphQL
