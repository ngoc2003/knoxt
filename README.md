# Freelancer Notebook

A comprehensive SaaS platform for freelancers to manage their business operations, built with modern web technologies.

## Features

- **Client Management**: Track customers, projects, and communications
- **Project & Task Management**: Organize work with projects, tasks, and priorities
- **Project Collaboration**: Share projects with role-based permissions and email invitations
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
- **Nodemailer** - Gmail-compatible SMTP invitation delivery
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
- **Docker** - Multi-stage production images
- **Nginx** - Production static web server with SPA fallback
- **ESLint & Prettier** - Code quality and formatting

## Project Structure

### Apps and Packages

- `api`: NestJS GraphQL backend with business logic modules
- `web`: React frontend application
- `packages/database`: Prisma schema and database utilities
- `packages/types`: Shared TypeScript domain and auth types
- `packages/ui`: Reusable React component library
- `packages/config`: Shared TypeScript and ESLint configurations

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Docker Desktop or another Docker-compatible runtime for container deployment
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

   To send invitations through Gmail, configure the following values in
   `apps/api/.env`. Use a Google App Password, not your normal Gmail password.

   ```env
   WEB_URL="http://localhost:5173"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER="your@gmail.com"
   SMTP_PASS="your_16_character_app_password"
   SMTP_FROM="Taskio <your@gmail.com>"
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
- Web app at http://localhost:5173
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

## Project Collaboration Flow

Projects support multiple members through role-based permissions, pending email
invitations, and secure invitation tokens.

### Roles and permissions

| Role   | Read project | Edit project/tasks/columns | Manage members | Delete project |
| ------ | ------------ | -------------------------- | -------------- | -------------- |
| Viewer | Yes          | No                         | No             | No             |
| Editor | Yes          | Yes                        | No             | No             |
| Admin  | Yes          | Yes                        | Yes            | No             |
| Owner  | Yes          | Yes                        | Yes            | Yes            |

Permissions are enforced on both the UI and API. API enforcement is the source
of truth.

### Sharing with a registered user

1. An owner or admin opens the project's **Share** dialog.
2. They enter an existing user's email and select a role.
3. `addProjectMember` immediately creates or updates a `ProjectMember`.
4. Any stale pending invitation for that project/email is removed.
5. The shared project appears in the member's project list.

### Sharing with an unregistered user

1. The server creates or updates a pending `ProjectInvitation`.
2. The invitation stores the project, normalized email, role, inviter, and a
   unique security token.
3. The server attempts to send a Gmail SMTP email with a link shaped like:

   ```text
   /register?email=member@example.com&invitation=<token>&project=<project-id>
   ```

4. The Share dialog shows the invitation as pending and allows it to be
   canceled.
5. If SMTP is unavailable, the invitation remains persisted and the UI reports
   that delivery is not configured or failed.

### Accepting an invitation

1. The invited user opens the emailed registration link.
2. The registration page prefills the email and submits the invitation token.
3. Registration validates that the token belongs to the submitted email.
4. All pending project invitations for that verified email become
   `ProjectMember` records in one transaction.
5. Claimed invitations are deleted and the user is redirected to the shared
   project.

The token is required to claim invitations. Registering with the same email
without the emailed token does not grant project access.

### Authorization architecture

Resolvers use the reusable permission decorator:

```ts
@RequirePermission(Permission.projectEdit, "project", "id")
```

`PermissionGuard` resolves the resource from GraphQL arguments. For task
operations it resolves the parent project first, then
`ProjectAuthorizationService` checks owner/member permissions.

When adding future role-controlled features:

1. Add a permission to `Permission` in
   `apps/api/src/core/common/enum/enums.ts`.
2. Map that permission to the appropriate roles in
   `ProjectAuthorizationService`, or add another resource authorization
   provider.
3. Protect the resolver with `@RequirePermission(...)`.
4. Keep repository queries aligned with the permission model.
5. Hide unavailable UI controls, but never rely on UI checks for security.

### Collaboration data model

- `ProjectMember`: active project access for a registered user.
- `ProjectInvitation`: pending access for an email address, protected by a
  unique token.
- `ProjectRole`: `viewer`, `editor`, or `admin`.
- Project owners are represented by `Project.userId` and implicitly have every
  project permission.

### Collaboration GraphQL operations

- `addProjectMember`: adds a registered member or creates/sends an invitation.
- `updateProjectMemberRole`: changes an active member's role.
- `removeProjectMember`: removes active project access.
- `cancelProjectInvitation`: cancels a pending invitation.
- `projectDetail`: returns members/invitations only to owners/admins; regular
  members receive only their own membership.

### Email delivery behavior

`MailService` uses Nodemailer and Gmail-compatible SMTP configuration.
Invitation persistence happens before delivery. Delivery errors are logged and
returned as `emailSent: false` without deleting the pending invitation.

Do not commit real SMTP credentials. Keep them in `apps/api/.env`.

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

The API and Web Dockerfiles use the repository root as their build context.
Run all Docker build commands from the repository root.

#### Apply database migrations

Apply committed migrations before starting a new API release:

```bash
DATABASE_URL="postgresql://username:password@host:5432/freelancer_notebook" \
  pnpm db:migrate:deploy
```

Production must use `prisma migrate deploy`, not `prisma migrate dev`.

#### Build production images

```bash
# API
docker build \
  -f apps/api/Dockerfile \
  -t freelancer-api \
  .

# Web: VITE_API_URL is embedded into the static assets at build time
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_API_URL=https://api.example.com \
  -t freelancer-web \
  .
```

The API image contains compiled JavaScript, the generated Prisma client, and
production dependencies. The Web image contains static Vite assets served by
Nginx; it does not run `vite preview`. `VITE_API_URL` must be an API URL that
users' browsers can reach.

#### Run production containers

Create an API runtime environment file outside the image:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:5432/freelancer_notebook
JWT_SECRET=replace_with_a_strong_secret
CORS_ORIGIN=http://localhost:8080
WEB_URL=http://localhost:8080
```

Set the `DATABASE_URL` host to a PostgreSQL server reachable from the API
container. When connecting to PostgreSQL running on Docker Desktop's host, use
`host.docker.internal` instead of `localhost`.

Then start both containers:

```bash
docker run --rm \
  --name freelancer-api \
  --env-file apps/api/.env \
  -p 3000:3000 \
  freelancer-api

docker run --rm \
  --name freelancer-web \
  -p 8080:8080 \
  freelancer-web
```

Open the Web application at http://localhost:8080. The Web container serves
SPA routes through Nginx and falls back to `index.html`.

Do not copy `.env` files into images. The root `.dockerignore` excludes them;
API secrets must be supplied at runtime.

#### Verify production images

```bash
# Health and request ID
curl -i http://localhost:3000/health/live
curl -i http://localhost:3000/health/ready

# Containers must run as non-root users
docker run --rm freelancer-api id
docker run --rm freelancer-web id

# Inspect final image layers
docker image history freelancer-api
docker image history freelancer-web

# Verify that the Web server supports SPA fallback
curl -i http://localhost:8080/projects/example
```

Expected container users:

- API: `node`
- Web: `nginx` (`uid=101`)

The production ports are:

- API: `3000`
- Web: `8080`

## Testing

```bash
# Run API tests
pnpm --filter api test

# Run with coverage
pnpm --filter api test:cov
```

## Development Guidelines

### Database Changes

1. Update Prisma schema in `packages/database/prisma/schema.prisma`
2. Generate migration: `cd packages/database && pnpm prisma migrate dev`
3. Regenerate client: `pnpm prisma generate`
4. Validate with `pnpm --filter database exec prisma validate`

### Validation Checklist

```bash
pnpm --filter database generate
pnpm --filter database exec prisma validate
pnpm --filter api build
pnpm --filter api test -- --runInBand
pnpm --filter web build
```

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
