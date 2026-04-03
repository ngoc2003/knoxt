# Freelancer Notebook

A comprehensive SaaS platform for freelancers to manage their business operations, built with modern web technologies.

## Features

- **Client Management**: Track customers, projects, and communications
- **Project & Task Management**: Organize work with projects, tasks, and priorities
- **Financial Tracking**: Manage income, expenses, invoices, and tax configurations
- **Note-Taking**: Attach notes to customers, projects, or tasks
- **AI Assistant**: Integrated AI chat for business assistance
- **Real-time GraphQL API**: Type-safe, efficient data operations

## Tech Stack

### Backend (API)

- **NestJS** - Progressive Node.js framework
- **GraphQL** (Apollo Server) - Code-first API with auto-generated schema
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure user sessions
- **bcrypt** - Password hashing
- **TypeScript** - Static type checking

### Frontend (Web)

- **React** - User interface library
- **Vite** - Fast build tool and dev server
- **Apollo Client** - GraphQL client with caching
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe frontend development

### Infrastructure

- **Turborepo** - Monorepo build system
- **pnpm** - Fast package manager
- **ESLint & Prettier** - Code quality and formatting

## Project Structure

### Apps and Packages

- `api`: NestJS GraphQL backend with business logic modules
- `web`: React frontend application
- `docs`: Next.js documentation site
- `packages/database`: Prisma schema and database utilities
- `packages/shared`: Shared TypeScript types and utilities
- `packages/ui`: Reusable React component library
- `packages/eslint-config`: ESLint configurations
- `packages/typescript-config`: TypeScript configurations

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ngoc2003/freelancer-notebook.git
   cd freelancer-notebook
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   ```bash
   # Copy environment file in the API
   cp apps/api/.env.example apps/api/.env

   # Copy environment file in the database package
   cp packages/database/.env.example packages/database/.env
   ```

4. **Configure your PostgreSQL database**

   ```bash
   # Update packages/database/.env with your database URL
   DATABASE_URL="postgresql://username:password@localhost:5432/freelancer_notebook"
   ```

5. **Setup the database**

   ```bash
   # Generate Prisma client
   cd packages/database
   pnpm prisma generate

   # Run migrations
   pnpm prisma migrate dev
   ```

## Development

### Run all services

```bash
pnpm dev
```

This starts:

- API server at http://localhost:3000
- Web app at http://localhost:3001
- GraphQL Playground at http://localhost:3000/graphql
- GraphQL Voyager at http://localhost:3000/voyager

### Run specific services

**API only:**

```bash
pnpm dev --filter=api
```

**Frontend only:**

```bash
pnpm dev --filter=web
```

**Documentation:**

```bash
pnpm dev --filter=docs
```

## API Documentation

### GraphQL Playground

Visit http://localhost:3000/graphql to explore the API interactively

### GraphQL Voyager

Visit http://localhost:3000/voyager for a visual representation of your schema

### Core API Modules

- **Authentication**: `register`, `login` mutations
- **Users**: User management and profiles
- **Customers**: Client/customer CRUD operations
- **Projects**: Project management with customer relationships
- **Tasks**: Task management with projects, priorities, and status tracking
- **Notes**: Note-taking system with customer/project associations
- **Finance**: Income, expense, invoice, and tax management
- **AI**: Chat sessions with AI assistant

### Example Queries

**Authentication:**

```graphql
mutation {
  register(
    data: {
      email: "user@example.com"
      name: "John Doe"
      password: "password123"
    }
  ) {
    accessToken
    user {
      id
      email
      name
    }
  }
}
```

**Customer Management:**

```graphql
query {
  listCustomers(pagination: { skip: 0, take: 10 }) {
    items {
      id
      name
      email
      company
    }
    total
  }
}
```

## Build & Deploy

### Build all packages

```bash
pnpm build
```

### Build specific package

```bash
pnpm build --filter=api
pnpm build --filter=web
```

### Production deployment

```bash
# Build for production
pnpm build

# Start API server
cd apps/api && pnpm start:prod

# Serve web app (after build)
cd apps/web && pnpm preview
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm test --filter=api
pnpm test --filter=web

# Run with coverage
pnpm test:cov
```

## Development Guidelines

### Database Changes

1. Update Prisma schema in `packages/database/prisma/schema.prisma`
2. Generate migration: `cd packages/database && pnpm prisma migrate dev`
3. Regenerate client: `pnpm prisma generate`

### Adding New Features

1. Create DTOs in the appropriate module
2. Update GraphQL resolvers and services
3. Add database models if needed
4. Write tests for new functionality

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

