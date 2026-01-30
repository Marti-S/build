# External Integrations

**Analysis Date:** 2026-01-27

## APIs & External Services

**Package Registry:**
- npm Registry - background update check for latest version
  - SDK/Client: `npm view` via `child_process.execSync` in `hooks/gsd-check-update.js`
  - Auth: none (public registry) in `hooks/gsd-check-update.js`

**Community/Links:**
- Discord invite - community link output in `bin/install.js` and `commands/gsd/join-discord.md`
- GitHub repository - source and changelog references in `package.json`, `commands/gsd/update.md`

## Data Storage

**Databases:**
- Not detected (no database clients or connections) in `package.json`

**File Storage:**
- Local filesystem only (settings, hooks, content) in `bin/install.js`, `scripts/build-hooks.js`

**Caching:**
- Local JSON cache at `~/.claude/cache/gsd-update-check.json` in `hooks/gsd-check-update.js`

## Authentication & Identity

**Auth Provider:**
- Not applicable (no auth flows or providers) in `bin/install.js`, `hooks/gsd-statusline.js`

## Monitoring & Observability

**Error Tracking:**
- None (no tracking SDKs) in `package.json`

**Logs:**
- Stdout/stderr console output in `bin/install.js`, `scripts/build-hooks.js`

## CI/CD & Deployment

**Hosting:**
- npm package distribution via CLI entrypoint in `package.json`

**CI Pipeline:**
- Not detected (no CI config files present) in `package.json`

## Environment Configuration

**Required env vars:**
- `CLAUDE_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME` for config directory resolution in `bin/install.js`

**Secrets location:**
- Not applicable (no secrets referenced) in `bin/install.js`

## Webhooks & Callbacks

**Incoming:**
- None (no webhook handlers) in `hooks/gsd-check-update.js`

**Outgoing:**
- None (no webhook emitters) in `hooks/gsd-check-update.js`

---

*Integration audit: 2026-01-27*
