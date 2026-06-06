# Create `SKILL.md` For `apps/web`

## Summary
Generate a complete Markdown `SKILL.md` that teaches another AI coding agent how to work effectively in `apps/web`, based only on inspected repo facts. The output should be the document content, not a filesystem edit.

## Key Content
- Include skill frontmatter:
  - `name: freelancer-notebook-web`
  - `description: Use when contributing to the Freelancer Notebook web app under apps/web: React/Vite UI, Apollo GraphQL, auth, customer/project/task/finance domains, shared shadcn-style UI, and repo-specific workflows.`
- Cover architecture:
  - Vite React app under `apps/web/src`
  - App bootstrap in `main.tsx`, providers in `app/App.tsx`, routes in `app/routes.tsx`
  - Domain modules under `modules/*`, shared UI/components/lib under `shared/*`, layout shell under `layout/Layout.tsx`
- Cover stack:
  - React 18, Vite 6, TypeScript config from `packages/config`
  - Apollo Client 4 via `@apollo/client/react`
  - React Router 7 `createBrowserRouter`
  - Tailwind CSS 4, Radix/shadcn-style primitives, lucide icons
  - Formik/Yup in auth forms, local component state in modal forms
  - Turborepo + pnpm workspace
- Cover business domains:
  - Auth stores `accessToken` and `currentUser` in `localStorage`
  - Customers have active/inactive status and income aggregation
  - Projects belong to customers and include status, date range, budget/incomes
  - Tasks use `todo`, `doing`, `done`; priorities are `low`, `medium`, `high`; Kanban drag/drop uses `react-dnd`
  - Finance currently mixes static UI data with early GraphQL support for income creation
  - Dashboard and some detail pages contain mock/static data patterns
- Cover coding conventions:
  - Prefer existing module folders and colocated `graphql/*.ts`
  - Use `@/...` aliases where suitable, though existing code also has relative imports
  - Use shared UI components from `src/shared/ui`
  - Use `cn()` from `shared/ui/utils.ts` for class merging
  - Prefer lucide icons for app UI
  - Keep page layout style consistent: `p-6`, white cards/tables, gray borders, blue/indigo action states
- Cover data-fetching:
  - GraphQL operations are constants created with `gql`
  - `useQuery`/`useMutation` come from `@apollo/client/react`
  - Mutations generally call `refetch()` or `refetchQueries` afterward
  - Apollo endpoint is currently hardcoded to `http://localhost:3000/graphql`
  - Error link clears auth and redirects on `UNAUTHENTICATED`
- Cover workflows and validation:
  - `pnpm --filter web dev`
  - `pnpm --filter web build`
  - `pnpm --filter web lint`
  - root `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm check-types`
  - Note inspected baseline: Vite build passes; lint currently fails because `globals` is missing; root `check-types` runs no tasks.
- Cover testing strategy:
  - No test runner or test files currently exist in `apps/web`
  - For now, validate with build plus targeted manual checks
  - When adding tests, recommend introducing focused component/hook tests around forms, route guards, Apollo interactions, and Kanban behavior rather than broad snapshots
- Cover AI-specific implementation guidance:
  - Read the relevant module, GraphQL operation file, and shared type definitions before editing
  - Match existing UI density and workflow style
  - Avoid introducing new state libraries, styling systems, or API clients
  - Keep GraphQL response fields aligned with UI needs and `@repo/types`
  - Remove debug `console.log`s when touching affected code
  - Replace `any` with local/domain types when practical
- Cover pitfalls:
  - `routes.tsx` currently imports `Layout` and `Settings` from `lucide-react`; an agent should verify intended imports from `src/layout/Layout.tsx` and `modules/settings/components/Settings.tsx` before route work
  - Vite build does not type-check the app
  - ESLint config only targets `js/jsx` and currently lacks a resolvable `globals` package
  - Finance and dashboard screens include mock data
  - Some GraphQL hooks pass an explicit `client`, others rely on `ApolloProvider`; keep behavior consistent within the touched module
  - Do not remove Vite React or Tailwind plugins because comments say they are required for Make

## Acceptance Criteria
- The generated `SKILL.md` is self-contained, well-structured, and valid Markdown.
- It includes concrete repo examples without inventing unsupported APIs or workflows.
- It clearly distinguishes current baseline limitations from recommended future improvements.
- It is concise enough for a coding agent to load as a skill but comprehensive enough to guide feature work, bug fixes, reviews, and tests.

## Assumptions
- The requested artifact is for another AI agent, so the document should prioritize operational guidance over human onboarding prose.
- Because no tests exist today, the skill should recommend pragmatic validation and future test targets rather than claiming an established test suite.
- The document should not be written to disk unless execution mode later requests an actual file edit.
