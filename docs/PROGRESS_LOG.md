# Progress log

One entry per ticket: what changed, what is left undone, and what to check by hand.
Gate for every ticket: `npm run check && npm run build`.

## T0 + T1 — Scaffold, shadcn/ui and theme (baseline commit)
- **Changed:** repo initialised (`git init -b main`); this first commit contains the T0 scaffold plus T1. shadcn (radix-nova) components in `src/components/ui/`; light/dark/system toggle (`src/lib/theme.ts`, `src/hooks/useTheme.ts`, `ThemeToggle.tsx`) stored under `pyacademy:theme`; no-flash script in `index.html`; mobile menu is a `Sheet`; index pages use `Card`/`Badge`; hard-coded neutral colours replaced by theme tokens; `next-themes` dropped (sonner uses our hook); `shadcn` moved to devDependencies; oxlint `only-export-components` off for `src/components/ui/**`.
- **Left undone:** `TooltipProvider` / `Toaster` not mounted (unused so far). `clsx` + `tailwind-merge` are now unused deps.
- **Check by hand:** toggle cycles light → dark → system and survives reload; code blocks in light mode have no visible border on white (pre-existing).
