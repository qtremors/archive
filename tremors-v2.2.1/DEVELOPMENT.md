# Tremors Portfolio - Developer Documentation

> Comprehensive documentation for developers working on Tremors Portfolio.

**Version:** 2.2.0 | **Last Updated:** 2026-01-14

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Architecture Overview

Tremors Portfolio follows a **Modern Full-Stack Next.js** architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│       Next.js 16 (App Router) + React 19 + Tailwind 4        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         Backend                              │
│         Next.js API Routes + Server Actions (Node.js)        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         Database                             │
│             PostgreSQL (NeonDB) via Prisma ORM 6             │
└──────────────────────────────────────────────────────────────┘
```

The project is organized with:
- **Frontend**: React Server Components (RSC) for performance, Client Components for interactivity (Terminal, Resume editing).
- **Backend**: API routes for admin actions and data fetching (GitHub sync, AI generation).
- **Database**: Relational data model for caching GitHub stats and storing site settings.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** | leverages React Server Components for zero-bundle-size data fetching. |
| **Prisma ORM** | Type-safe database access and easy migrations. |
| **Custom Auth** | Lightweight PBKDF2/HMAC implementation avoids complex auth provider dependencies for a single-user app. |
| **Tailwind CSS 4** | Zero-runtime CSS-in-JS performance with utility-first reliability. |

---

## Project Structure

```
tremors/
├── app/
│   ├── src/
│   │   ├── app/              # App Router Pages & API
│   │   ├── components/       # Reusable React components
│   │   ├── lib/              # Core logic (auth, db, github)
│   │   ├── types/            # TypeScript definitions
│   │   └── ...
│   ├── prisma/               # Database schema
│   ├── public/               # Static assets
│   ├── .env.example          # Template for environment variables
│   └── next.config.ts        # Next.js configuration
├── Templates/                # Documentation templates
├── README.md                 # User-facing documentation
├── DEVELOPMENT.md            # This file
├── CHANGELOG.md              # Version history
└── LICENSE.md                # License terms
```

---

## Database Schema

### Models Overview

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Repo** | Caches GitHub repository data | `id`, `name`, `stars`, `topics`, `hidden` |
| **Settings** | Global site configuration | `availableForWork`, `resumeSummary` |
| **Admin** | Single-user admin authentication | `passwordHash` |
| **NewspaperEdition** | AI-generated news content | `headline`, `bodyContent`, `generatedBy`, `agentName`, `personality` |
| **Activity/Commit** | Caches GitHub history | `sha`, `message`, `date` |

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_USERNAME` | Your GitHub profile to sync | `qtremors` |
| `ADMIN_SECRET` | Secret command for terminal login | `my_secret_login` |
| `DATABASE_URL` | Postgres connection string | `postgres://...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub PAT for higher rate limits | - |
| `AUTH_SECRET` | Signing key for sessions | Auto-generated |
| `GEMINI_API_KEY` | Google AI Studio key for News generation | - |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/RSS | `http://localhost:3000` |

---

## Configuration

### Security (next.config.ts)

| Setting | Default | Description |
|---------|---------|-------------|
| `Content-Security-Policy` | Strict | Blocks inline scripts/styles (except where needed) and limits sources. |
| `X-Frame-Options` | DENY | Prevents clickjacking. |

---

## Testing

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage
```

### Test Coverage

| Test File/Category | Coverage |
|--------------------|----------|
| `auth.test.ts` | Verification of password hashing and session tokens |
| `sanitize.test.ts` | Input sanitization for terminal commands |
| `api/*.test.ts` | Integration tests for API endpoints |

---

## Deployment

### Vercel Deployment

1. **Connect GitHub**: Import the repository in Vercel.
2. **Database**: Add a Vercel Postgres (Neon) integration from the Storage tab.
3. **Environment**: Add `GITHUB_USERNAME`, `ADMIN_SECRET`, and `GEMINI_API_KEY` in settings.
4. **Deploy**: Vercel will build and deploy cleanly.

```bash
# Production Build
npm run build
```

### Production Checklist

- [ ] Set `AUTH_SECRET` in environment variables.
- [ ] Configure `GEMINI_API_KEY` if using News feature.
- [ ] Log in via terminal (`your_secret_command`) to set the initial password.

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Database connection error** | Check `DATABASE_URL` matches your Neon/Postgres credentials. |
| **GitHub rate limit** | Add `GITHUB_TOKEN` to environment variables. |
| **Admin login fails** | Ensure cookies are enabled and `AUTH_SECRET` is consistent. |

### Debug Mode

Run locally with development logging enabled.

```bash
npm run dev
```

---


<p align="center">
  <a href="README.md">← Back to README</a>
</p>
