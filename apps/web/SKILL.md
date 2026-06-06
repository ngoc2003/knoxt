---
name: freelancer-notebook-web
description: Use when contributing to Freelancer Notebook under apps/web, especially React/Vite UI, Apollo GraphQL, project collaboration, custom Kanban columns, role permissions, invitation flows, auth, and shared UI.
---

# Freelancer Notebook Web

Use this skill for web changes and for API/database changes directly required
by a web workflow.

## Read First

Before editing a feature, inspect:

1. Its page/component under `apps/web/src/modules/<domain>`.
2. Its colocated `graphql/*.ts` operations.
3. Relevant shared types under `packages/types/src`.
4. For persisted behavior, the matching API resolver/service/repository and
   `packages/database/prisma/schema.prisma`.

Do not assume the UI response shape exists on the server. Keep GraphQL fields,
API models, repository includes, and UI types aligned.

## Architecture

- Bootstrap: `apps/web/src/main.tsx`
- Providers: `apps/web/src/app/App.tsx`
- Routes: `apps/web/src/app/routes.tsx`
- Layout shell: `apps/web/src/layout/Layout.tsx`
- Domain modules: `apps/web/src/modules/*`
- Shared components and Apollo setup: `apps/web/src/shared/*`
- Shared shadcn/Radix-style primitives: `apps/web/src/shared/ui/*`

Stack: React 18, Vite 6, React Router 7, Apollo Client 4, Tailwind CSS 4,
Radix primitives, lucide icons, Formik/Yup, and `react-dnd`.

## UI Conventions

- Prefer existing module folders and colocated GraphQL files.
- Prefer `@/...` imports and shared UI components.
- Use `cn()` from `shared/ui/utils.ts` for conditional class merging.
- Match existing density: `p-6`, white cards, gray borders, blue/indigo
  actions.
- Prefer lucide icons.
- Avoid new state libraries, API clients, or styling systems.
- Replace touched `any` types when practical and remove debug logs.

## Apollo Conventions

- Define operations with `gql`.
- Import hooks from `@apollo/client/react`.
- Include every field required by the consuming component.
- Existing mutations commonly use `refetchQueries` or `refetch`.
- Handle mutation failures and preserve/rollback optimistic local state.
- Apollo endpoint and auth/error behavior live in `shared/lib/apollo.ts`.

## Project and Kanban Model

- Projects belong to customers and have owner `userId`.
- Projects contain persisted custom `columns` ordered by `orderIndex`.
- Task `status` is a string column key, not a fixed enum.
- New projects receive `todo`, `doing`, and `done` default columns.
- Kanban task and column drag/drop use separate `react-dnd` item types.
- Project cards receive tasks and columns from the server and calculate counts
  per column.

When changing columns or task status:

1. Preserve server validation that task status belongs to the project.
2. Return ordered columns from repositories.
3. Keep project list and detail queries consistent.
4. Verify drag/drop persistence after refresh.

## Collaboration and Permissions

Roles:

- `viewer`: read only.
- `editor`: edit projects, tasks, and columns.
- `admin`: editor permissions plus member management.
- Owner: all permissions, including project deletion.

The UI hides unavailable actions, but API guards are always authoritative.

Relevant server foundation:

- `apps/api/src/core/authorization/require-permission.decorator.ts`
- `apps/api/src/core/authorization/permission.guard.ts`
- `apps/api/src/core/authorization/project-authorization.service.ts`

Protect new resolver operations with:

```ts
@RequirePermission(Permission.projectEdit, "project", "id")
```

For task resources, use resource type `"task"` so the guard resolves the
parent project.

Do not add role-name checks directly to resolvers. Add a reusable permission,
map it to roles, apply the decorator, and align repository access filters.

## Invitation Flow

The Share dialog supports active members and pending invitations.

- Registered email: `addProjectMember` creates/updates `ProjectMember`.
- Unknown email: server persists `ProjectInvitation`, then attempts SMTP
  delivery.
- Email link includes `email`, secure `invitation` token, and `project`.
- Registration submits `invitationToken`; the server verifies token/email,
  claims invitations transactionally, and deletes them.
- Pending invitations can be canceled.
- Failed/unconfigured SMTP leaves the invitation persisted and reports
  `emailSent: false`.

Never grant access based only on a typed email. Invitation claiming requires
the emailed token.

When changing invitation UI, keep these operations aligned:

- `PROJECT_DETAIL_QUERY`
- `ADD_PROJECT_MEMBER_MUTATION`
- `UPDATE_PROJECT_MEMBER_ROLE_MUTATION`
- `REMOVE_PROJECT_MEMBER_MUTATION`
- `CANCEL_PROJECT_INVITATION_MUTATION`

## Email Configuration

Gmail SMTP settings are documented in `apps/api/.env.example`. Use a Google
App Password, never a normal Gmail password. Do not commit `.env`.

Mail implementation:

- `apps/api/src/infrastructure/mail/mail.module.ts`
- `apps/api/src/infrastructure/mail/mail.service.ts`

Invitation persistence must happen before email delivery.

## Known Baseline

- Auth stores `accessToken` and `currentUser` in `localStorage`.
- Dashboard, finance, and some detail screens still contain mock/static data.
- Web currently has no test runner or component tests.
- Vite build succeeds but does not provide a dedicated component test suite.
- Apollo hooks generally rely on `ApolloProvider`; stay consistent within the
  touched module.

## Validation

For web-only changes:

```bash
pnpm --filter web build
```

For GraphQL, permission, invitation, or persisted workflow changes:

```bash
pnpm --filter database generate
pnpm --filter database exec prisma validate
pnpm --filter api build
pnpm --filter api test -- --runInBand
pnpm --filter web build
git diff --check
```

Database changes require a checked-in migration under
`packages/database/prisma/migrations`.

For collaboration changes, manually verify:

1. Viewer cannot drag or edit.
2. Editor can edit but cannot share.
3. Admin can manage members but cannot delete the project.
4. Registered-user sharing creates immediate access.
5. Unknown-user sharing creates a pending invite.
6. Registration through the emailed token opens the shared project.
7. Refresh preserves task and column ordering.
