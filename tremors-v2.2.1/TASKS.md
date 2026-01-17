# Tremors Implementation Tasks & Codebase Review

> **Project:** Tremors  
> **Version:** 2.2.0
> **Last Updated:** 2026-01-14

---

## 🔍 Current Findings

### 🛡️ Security
- [x] **API Rate Limiting Middleware**: Created centralized middleware at `middleware.ts`.
- [ ] **CSP Hardening**: Review `unsafe-inline`/`unsafe-eval` in `next.config.ts` (required by Next.js).

### 🏗️ Architecture
- [ ] **Database Typing**: Migrate `Repo.topics` from JSON string to `JSONB`.

### 🧪 Logic & Bugs
- [ ] **Relative Time Sync**: Audit `ProjectCard` relative time for hydration mismatches.

### 🎨 UI/UX
- [ ] **Loading States**: Add skeleton loaders to `ProjectsGrid`.
- [ ] **Accessibility**: Terminal output needs `aria-live` blocks.
- [ ] **Keyboard Navigation**: Audit modals for focus trapping.

---

## � CodeRabbit PR Review (v2.2.0)

### Security
- [ ] **Weak IP Fallback** (`middleware.ts:20-30`): UA-based fallback is spoofable. Replace with hashed anonymous ID using SHA-256 + server-side salt from env.
- [ ] **Rate Limit Key Collision** (`middleware.ts:83-87`): Key truncates to 3 segments causing `/api/newspaper/generate` to share key with `/api/newspaper/*`. Use exact route from config.

### Code Quality
- [ ] **Duplicate CSS Class** (`ProjectsTable.tsx:83-89`): Remove redundant `flex` (keep `inline-flex`).
- [ ] **Unused Parameter** (`SpotlightSection.tsx:73-93`): Remove unused `idx` from map callback.
- [ ] **Type Safety** (`ProjectsGrid.tsx:44-61`): Replace `any` with proper Repo type, preserve DB fields.

### UI/Layout
- [ ] **Border Conflicts** (`TechnicalProficiencies.tsx:15`): `md:nth-child` rules conflict with `lg` layout. Use `last:border-r-0` or grid gap approach.
- [ ] **Hardcoded Version** (`TerminalWelcome.tsx:22`): Replace "v2.0" with centralized `APP_VERSION` constant.

### Documentation
- [ ] **Markdown Lint** (`CHANGELOG.md:51-54`): Fix 4-space indent to 2-space for nested lists.

---

## �📋 Backlog

### High Priority
- [ ] JSONB migration for `topics`

### Medium Priority
- [ ] SEO: Dynamic meta tags for editions/projects
- [ ] Unit tests for `useFetch`, `SettingsContext`, `useTerminalAdmin`

### Low Priority
- [ ] Terminal games (Snake/Tetris)
- [ ] RSS feed metadata extensions

---

## 🏗️ Technical Notes

- **Dates**: Use `formatIST` from `lib/date` for server/client consistency.
- **Auth**: `verifyAdminCookie()` for APIs, `AdminContext` for client components.
- **Fetching**: `useFetch<T>(url)` for reads, `fetch`/`useApiMutation` for mutations.
- **Providers**: Use `ProviderComposer` for nested providers.
