<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repo notes

- Single Next.js 16 (App Router) app — no monorepo packages. Source lives in `src/app`, `src/components`, `src/hooks`, `src/lib`.
- Path alias: `@/*` → `./src/*` (tsconfig paths + `components.json` aliases).
- Styling: Tailwind v4 via `@import "tailwindcss"` (+ `tw-animate-css`, `shadcn/tailwind.css`) in `src/app/globals.css`; dark mode is **class-based** (`@custom-variant dark (&:is(.dark *))`), not the media-query default.
- shadcn (`base-nova` style, registry v4): primitives in `src/components/ui`; `cn` comes from the `cn` package via `src/lib/utils.ts`.
- Code highlighting: shiki (`src/lib/highlighter.tsx`, JS regex engine, on-demand language loading); streaming handled by `src/hooks/use-highlighted-code.ts` (carry grammar state between chunks; strip trailing newline).
- `next.config.ts`: `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback`, `reactCompiler: true`, and a Turbopack Tailwind loader rule.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm run start`
- `npm run lint` — ESLint (flat config via `eslint-config-next`); known pre-existing errors in generated code (`react-hooks/set-state-in-effect` in `src/components/ui/carousel.tsx` and `src/hooks/use-mobile.ts`) — don't attribute them to new changes.

## Status

- No test suite, no typecheck script, and no CI workflows configured yet.
- No env vars required yet; `.env*` is gitignored, and client-side vars need the `NEXT_PUBLIC_` prefix.
