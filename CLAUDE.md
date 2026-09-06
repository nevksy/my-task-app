# CLAUDE.md

## Stack

React + Vite + TypeScript + Tailwind CSS.

## Build verification

Always run `npm run build` after completing changes, and fix any errors before
considering the work done.

## Data storage

Client-side only. All app data lives in the browser's `localStorage`. Never add
or connect to a backend database or external service (e.g. Supabase, Firebase,
a custom API) — nothing here should require a network request to function.
