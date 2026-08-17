# Zaqerai Optimizations Discord Bot

Discord bot for Zaqerai Optimizations that shares the community and X profile, publishes service embeds, and creates private support tickets.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `DISCORD_BOT_TOKEN` — the bot token, stored through Replit Secrets
- Optional env: `DISCORD_GUILD_ID` — registers slash commands to one guild immediately; without it, commands are registered globally

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/bot/discordBot.ts` — Discord client, slash commands, service panels, and ticket lifecycle
- `artifacts/api-server/src/bot/config.ts` — service copy, terms text, public links, colors, and ticket copy
- `artifacts/api-server/src/index.ts` — starts the API server and Discord client together

## Architecture decisions

- Services are published through slash commands so an administrator can choose the destination channel, ticket category, and embed color each time.
- Ticket buttons store the chosen category ID on the button, so different service panels can route to different ticket categories.
- The bot stays disabled when `DISCORD_BOT_TOKEN` is absent; the API health server still starts for safe local development.
- Slash commands use a guild registration when `DISCORD_GUILD_ID` is present and otherwise fall back to global registration.

## Product

- `/join` — share the Zaqerai Optimizations Discord invite.
- `/x` — share the ZaqeraiTweaks X profile.
- `/tos channel embed_color` — publish the Terms of Service embed.
- `/book-optimization channel ticket_channel embed_color` — publish optimization packages and replace the make-ticket text with the selected ticket channel.
- `/overclocking channel ticket_channel embed_color` — publish overclocking packages and replace the make-ticket text with the selected ticket channel.
- `/embed title description` — publish a custom branded embed with optional color, image, and footer.
- `/giveaway start|end|reroll` — run giveaways with entry buttons, winners, ending, and rerolling.
- `/ticket setup|customize|close` — create and customize the ticket system or close the current ticket.
- Ticket buttons create private channels under the selected category and provide a close-ticket action.

## User preferences

- Keep the Zaqerai Optimizations copy and public links in the bot configuration rather than scattering them through command handlers.

## Gotchas

- The bot needs Discord Developer Portal permissions for `applications.commands`, `View Channels`, `Send Messages`, `Manage Channels`, and `Manage Roles`/permission overwrite access as appropriate.
- For service commands, `ticket_channel` means the existing text channel where users open tickets. `/ticket setup` creates the ticket category and panel separately.
- Global slash commands can take up to an hour to appear; use `DISCORD_GUILD_ID` while setting up a server for immediate registration.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
