# Technology Stack

**Analysis Date:** 2026-01-27

## Languages

**Primary:**
- JavaScript (Node.js) - CLI scripts and hooks in `bin/install.js`, `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`, `scripts/build-hooks.js`

**Secondary:**
- Markdown - Command/agent/system content in `commands/gsd/*.md`, `agents/*.md`, `get-shit-done/**/*.md`
- JSON - Package metadata and configuration in `package.json`, `package-lock.json`

## Runtime

**Environment:**
- Node.js >=16.7.0 in `package.json`

**Package Manager:**
- npm in `package-lock.json`
- Lockfile: present in `package-lock.json`

## Frameworks

**Core:**
- None (plain Node.js CLI) in `bin/install.js`

**Testing:**
- Not detected (no test framework dependencies) in `package.json`

**Build/Dev:**
- esbuild ^0.24.0 - dev dependency for build tooling in `package.json`
- build:hooks script (copies hooks) in `package.json`, implemented in `scripts/build-hooks.js`

## Key Dependencies

**Critical:**
- None (no runtime dependencies) in `package.json`

**Infrastructure:**
- esbuild ^0.24.0 - dev-only build dependency in `package.json`

## Configuration

**Environment:**
- Config directory selection via `CLAUDE_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME` in `bin/install.js`
- Settings and cache files written under user config directories in `bin/install.js`, `hooks/gsd-check-update.js`

**Build:**
- Build hook copier in `scripts/build-hooks.js`
- npm script `build:hooks` in `package.json`

## Platform Requirements

**Development:**
- Node.js >=16.7.0 per `package.json`

**Production:**
- Distributed as an npm CLI package with entrypoint `bin/install.js` and bundled hooks in `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`

---

*Stack analysis: 2026-01-27*
