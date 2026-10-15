# napita-mobile — instructions for Claude

This is the Ñapita Expo app. The product rules, design and decisions live in the docs repo
https://github.com/NapitaService/Napita-docs. Read its `CLAUDE.md`, `README.md`,
`design/README.md` and `product/` before changing anything, and follow them.

On a laptop, the docs repo is usually cloned next to this one (`../Napita-docs`). Read it
there, and run `git pull` in it first so it's current. If it isn't there, offer to clone it
next to this folder.

The team are not developers: explain in plain English, keep steps small, and say what you're
about to do before doing it.

Also follow `AGENTS.md` (Expo-specific guidance).

## In this repo

- All app wording goes in `src/i18n/es-CO.json` and `src/i18n/en.json`. Never hard-code text in screens.
- Format money, times, distances and dates with `useFormat()` (`src/lib/use-format.ts`).
- Colors and fonts come from `src/theme.ts`. Don't add new hex values in screens.
- Each screen's file comment names the design file it copies from `design/canvas/`.
- Before committing: `npm run typecheck`, `npm run lint`, `npm run check:i18n`.
- Small commits with clear English messages. No secrets in git; use `.env.example`.
