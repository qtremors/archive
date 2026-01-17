# Tremors Portfolio - Next.js App

This is the Next.js 16 portfolio application. See the [main README](../README.md) for full documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Optional | GitHub PAT for higher rate limits |
| `GITHUB_USERNAME` | Yes | Your GitHub username |
| `ADMIN_SECRET` | Yes | Secret command for admin login |
| `DATABASE_URL` | Yes | Database connection string |
| `GEMINI_API_KEY` | Optional | For AI newspaper content |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Run linter |

## Related Files

- [../README.md](../README.md) - Full documentation
- [../CHANGELOG.md](../CHANGELOG.md) - Version history
- [../AGENTS.md](../AGENTS.md) - AI agent context
