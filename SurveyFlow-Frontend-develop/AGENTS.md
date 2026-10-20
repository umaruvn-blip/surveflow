# SurveyFlow Frontend Working Agreement

This file defines the repository-wide rules for humans and coding agents. The keywords **MUST**, **SHOULD**, and **MAY** indicate required, recommended, and optional behavior.

## 1. Project Overview

SurveyFlow Frontend is a Vietnamese survey platform built as a React Router application with server-side rendering.

The approved stack is:

- React 19 and TypeScript in strict mode.
- React Router 7 in Framework Mode with SSR.
- Tailwind CSS 4 and shadcn/ui.
- TanStack Query for server state.
- Zustand for client application and authentication state.
- Axios for HTTP transport.
- React Hook Form and Zod for forms and validation.
- Vitest for automated tests.
- npm and `package-lock.json` for dependency management.

These rules apply to the entire repository unless a more specific `AGENTS.md` or `AGENTS.override.md` exists in a child directory.

Contributors MUST preserve the established stack unless an approved architectural decision changes it. New production dependencies SHOULD be added only when the existing stack cannot reasonably solve the problem.

## 2. Instruction Priority

Use project guidance in this order:

1. The active user or product requirement.
2. The nearest applicable `AGENTS.md` or `AGENTS.override.md`.
3. This root `AGENTS.md`.
4. `RULES.md` for detailed engineering conventions.
5. `docs/` for domain-specific design and implementation guidance.
6. `README.md` for setup and operational instructions.

This file is the authoritative repository-level working agreement. If it conflicts with `RULES.md`, follow this file and update the stale document in the same change when appropriate.

Contributors MUST read the relevant instructions and existing implementation before editing. They MUST preserve unrelated user changes and SHOULD prefer the smallest complete change that satisfies the requirement.

## 3. Architecture & Folder Structure

Use the existing structure under `app/`:

- `apis/`: HTTP calls and response unwrapping only.
- `components/`: reusable application components.
- `components/ui/`: shadcn/ui primitives.
- `config/`: validated environment and application configuration.
- `constants/`: shared constants and query keys.
- `hooks/queries/`: TanStack Query hooks and mutation side effects.
- `libs/`: shared clients and singletons such as Axios and QueryClient.
- `mocks/`: mock adapters, fixtures, and related tests.
- `pages/`: page-level UI, one page per folder.
- `providers/`: application-wide React providers.
- `routes/`: thin route modules, guards, loaders, actions, and metadata.
- `schemas/`: reusable Zod schemas.
- `stores/`: Zustand stores for client state.
- `types/`: shared domain and API types.
- `utils/`: pure reusable helpers.

Route modules MUST remain thin. Reusable UI, API calls, query logic, and business logic MUST NOT be placed directly in route modules.

Pages SHOULD compose reusable components and hooks rather than implement transport or cache behavior. Shared code MUST be placed in the narrowest appropriate layer and MUST NOT create circular dependencies.

## 4. Coding Conventions

- TypeScript strictness MUST remain enabled. New `any` types are prohibited unless an unavoidable boundary is documented.
- Ordinary files and folders MUST use `kebab-case`.
- Reusable components and pages MUST use `PascalCase` folders and files with a local `index.ts` barrel.
- Components and types MUST use `PascalCase`; variables and functions MUST use `camelCase`.
- Shared frontend types SHOULD be named by their domain role, such as `SurveyDetail`, `SurveySummary`, or `SurveyDraftInput`. Their names do not need to mirror backend class names or carry a `Dto` suffix.
- Global static constants SHOULD use `UPPER_SNAKE_CASE`.
- Internal source imports, asset imports, and re-exports MUST use the `@/` alias; do not use relative paths such as `./` or `../`. Framework-generated route type imports MAY retain the path required by the framework.
- Imports SHOULD be grouped as external packages, internal aliases, then relative imports.
- Existing utilities and components MUST be checked before creating duplicates.
- Functions and components SHOULD have one clear responsibility.
- Comments SHOULD explain decisions or non-obvious constraints, not restate the code.
- Dead code, commented-out implementations, and speculative abstractions MUST NOT be committed.
- Public behavior or configuration changes MUST update the relevant README or documentation.

Code MUST follow the repository Prettier and ESLint configuration. Do not manually edit generated React Router types or build output.

## 5. UI & Design System

- Reuse `app/components/ui` primitives before creating new UI primitives.
- Reuse project components from `app/components` before duplicating markup.
- Global tokens and cross-page styles MUST live in `app/app.css`.
- Visual decisions SHOULD follow `docs/design-system.md`.
- Use Tailwind utilities for component layout and state styling. Inline style objects SHOULD be avoided.
- Existing design tokens SHOULD be used instead of arbitrary hard-coded colors.
- The SurveyFlow blue–cyan–green gradient SHOULD be reserved for brand moments and primary actions.
- Use Lucide icons unless an approved product asset requires otherwise.
- User-facing product copy MUST be Vietnamese unless a requirement explicitly specifies another language. Code identifiers remain English.
- New interfaces MUST be responsive and verified at mobile and desktop widths.
- Interactive elements MUST support keyboard navigation, visible focus states, semantic labels, and adequate contrast.
- Loading, empty, error, success, disabled, and pending states MUST be handled when relevant.
- A control MUST perform the advertised action or be visibly disabled. Do not ship dead buttons that appear functional.

## 6. Routing, Auth & Authorization

Current route intent:

- `/` is public.
- `/login` is guest-only.
- `/dashboard` and future application routes are protected unless explicitly designed as public.

Guest and protected behavior MUST remain in route layout guards rather than being duplicated across pages. Redirects for unauthenticated users MUST preserve the `redirectTo` query parameter. Authenticated users visiting `/login` SHOULD be redirected to `/dashboard`.

The backend owns refresh tokens in HttpOnly cookies. Frontend JavaScript MUST NOT read, log, or persist refresh tokens. Access tokens and the authenticated user are managed by `useAuthStore` and persisted only in `sessionStorage`.

Login and logout MUST go through TanStack Query mutations. Logout in API mode MUST call the backend and MUST clear client auth state and related cache even if the network request fails.

Role values are `USER` and `ADMIN`. UI role checks MAY control presentation and navigation, but MUST NOT be treated as sufficient security; backend authorization remains mandatory.

Passwords, access tokens, cookies, authorization headers, secrets, and sensitive user data MUST NOT be logged or committed.

## 7. API, Server State & Mock Mode

### API boundaries

- Pages and components MUST NOT call Axios directly.
- `apis/*.api.ts` MUST own transport calls and unwrap backend `ApiResponse<T>` envelopes.
- Shared API response types, including `ApiResponse<T>`, `PageResponse<T>`, and `ErrorResponse`, MUST live in `types/api-response.type.ts`; response processing functions belong in `utils/api-response.ts`.
- `hooks/queries/**` MUST own `useQuery`, `useMutation`, cache updates, invalidation, and mutation side effects.
- Error mapping SHOULD remain centralized rather than parsing Axios errors throughout the UI.
- Every environment variable MUST be validated in `app/config/env.ts` and documented in `.env.example`.

### State management

- Query keys MUST be serializable arrays and MUST be defined in `constants/query-keys.ts`.
- Query keys SHOULD be hierarchical and contain every dependency used by the query function.
- Cache updates and invalidation SHOULD target the narrowest relevant key.
- Zustand MUST be used only for client state that must exist outside the server-state cache.
- Server collections MUST NOT be duplicated in Zustand.

### Mock mode

- `VITE_ENABLE_MOCK=true` MUST allow the documented demo flow to work without a backend.
- `VITE_ENABLE_MOCK=false` MUST use the real API without requiring page or hook changes.
- Mock behavior MUST live at the API boundary in `app/mocks`, not in scattered component conditions.
- Mock responses MUST match production domain types and MUST preserve the same TanStack Query, Zustand, guard, and navigation flow.
- Mock mode MUST NOT activate silently when the real API fails.
- USER and ADMIN demo accounts MUST remain distinct and covered by tests.
- Features expected to work in demos SHOULD include representative mock data.
- Demo credentials MUST be clearly labeled and MUST never contain real secrets or personal data.

## 8. Testing & Definition of Done

Tests MUST be added or updated for behavior that is practical to verify automatically, including:

- Validation and pure business logic.
- Query or mutation behavior that changes cache or auth state.
- Mock adapters and role-specific behavior.
- Route guards and permission decisions that are prone to regression.
- Bug fixes when a regression test can reasonably reproduce the issue.

Before handing off code changes, contributors MUST run:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

If a command cannot run, the handoff MUST state the exact command, failure, and reason. Verification MUST NOT be claimed unless it was performed.

A change is complete only when:

- The requested user flow works.
- Relevant loading, empty, error, disabled, and success states are addressed.
- API and mock modes remain intentionally separated.
- Responsive and accessible behavior has been considered.
- Types remain explicit and quality gates pass.
- Documentation and `.env.example` are updated when behavior or configuration changes.

## 9. Git & Change Safety

- Existing and uncommitted work belongs to its author and MUST be preserved.
- Unrelated files MUST NOT be reformatted or rewritten as part of a focused change.
- `node_modules/`, `build/`, `.react-router/`, local `.env` files, logs, credentials, tokens, and editor artifacts MUST NOT be committed.
- Generated files MUST NOT be manually edited.
- Commits SHOULD be focused and describe the user-visible or architectural outcome.
- Shared history MUST NOT be rewritten, force-pushed, or reset without explicit authorization.
- Branches, files, migrations, and user data MUST NOT be deleted without confirming the exact intended scope.
- Destructive Git commands such as `git reset --hard` and broad checkout/revert operations MUST NOT be used without explicit approval.
- New migrations or persistent data changes MUST be forward-safe and reviewed for development and production impact.

## 10. AGENTS.md Evolution Policy

This file is expected to evolve with the codebase. Update it when:

- The team approves a new architectural decision or dependency boundary.
- A convention becomes the repeated standard across features.
- A recurring defect reveals a missing preventive rule.
- A quality gate, security requirement, mock policy, or delivery workflow changes.
- A new repository area requires rules that affect most contributors.

Do not update this file for a one-off ticket, temporary workaround, personal preference, or implementation detail better documented near the code.

Every new rule MUST be specific, actionable, and testable or reviewable. It SHOULD state the safe alternative when prohibiting behavior. Rules MUST NOT contradict the current architecture; update the implementation or scope the rule appropriately.

Changes to this file SHOULD be reviewed like code. The change description SHOULD explain why the rule is needed and which recurring decision or risk it addresses. Git history is the change log; do not maintain a duplicate chronological log inside this file.

When one area needs different rules, add a scoped `AGENTS.md` or `AGENTS.override.md` near that code instead of growing the root file indefinitely. A scoped file MUST document only the differences and MUST NOT copy the entire root file.
