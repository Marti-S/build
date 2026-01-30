# Stack Research

**Domain:** Codex CLI integration for /gsd workflows in a Node.js installer
**Researched:** 2026-01-27
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Codex CLI (`@openai/codex`) | 0.92.0 | Target CLI runtime for /gsd workflows | Official Codex CLI supports skills, config.toml, and AGENTS.md, which are the native integration surfaces. |
| Codex project config (`.codex/config.toml`) | 0.92.0 schema | Project-scoped configuration for Codex CLI | Codex loads project config safely (trusted projects) and avoids touching user-level settings. |
| Codex skills (`SKILL.md` in `.codex/skills/`) | 0.92.0 | Package /gsd workflows as discoverable skills | Skills are the supported, reusable workflow format for Codex CLI with explicit/implicit invocation. |
| AGENTS.md instructions | 0.92.0 | Repository-level guidance to mirror existing Claude/OpenCode behavior | Codex reads AGENTS.md on startup with documented precedence, providing parity with existing instruction files. |
| Node.js | >=20.0.0 | Installer runtime + stable built-in test runner | Node test runner is stable as of v20, enabling parity tests without extra dependencies. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (prefer stdlib) | N/A | Keep installer minimal and avoid TOML parsing deps | Use direct file templates for `.codex/` assets unless you must merge existing TOML. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `node:test` | Automated parity tests for Codex integration | Built into Node >=20; run with `node --test`. |

## Installation

```bash
# Core (required for users running Codex CLI)
npm install -g @openai/codex@0.92.0

# Supporting
# (none)

# Dev dependencies
# (none if using node:test)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Codex skills in `.codex/skills/` | AGENTS.md-only instructions | If you want the smallest footprint and can accept less discoverable workflows. |
| Node.js >=20 + `node:test` | `tap@21.5.0` | If you must keep Node <20 and still need a maintained test runner. |
| Project-scoped `.codex/config.toml` | Editing `~/.codex/config.toml` | Only if a global default is truly required; avoid changing user settings in an installer. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| MCP servers or external integrations | Violates the no-external-services requirement and expands scope | Local skills + AGENTS.md + project config only. |
| `vitest@4` | Requires Vite >=6 and Node >=20, which adds a new build tool | Built-in `node:test` on Node >=20. |
| `toml` or `@iarna/toml` | Stale releases and older TOML spec support | Avoid parsing by writing project-scoped `.codex/config.toml` templates. |

## Stack Patterns by Variant

**If Node version must stay at >=16.7:**
- Use `tap@21.5.0` for parity tests
- Because `node:test` is stable only from Node 20

**If workflows must apply across all repos on a machine:**
- Install skills into `$CODEX_HOME/skills` instead of `.codex/skills`
- Because Codex loads user-scoped skills across projects

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Node.js >=20 | `node:test` | Test runner is stable starting in Node v20. |
| `@openai/codex@0.92.0` | `.codex/config.toml`, `.codex/skills`, `AGENTS.md` | Config and instruction discovery are tied to Codex CLI behavior. |

## Sources

- https://github.com/openai/codex/releases/latest — Codex CLI current version
- https://developers.openai.com/codex/cli — Codex CLI overview and setup
- https://developers.openai.com/codex/config-basic — Project/user config locations and precedence
- https://developers.openai.com/codex/config-reference — Config schema details
- https://developers.openai.com/codex/guides/agents-md — AGENTS.md discovery and precedence
- https://developers.openai.com/codex/skills — Skills overview and locations
- https://developers.openai.com/codex/skills/create-skill — SKILL.md format
- https://nodejs.org/api/test.html — Node test runner stability (stable in v20)
- https://vitest.dev/guide/ — Vitest requires Vite >=6 and Node >=20
- https://www.npmjs.com/package/toml — TOML parser version and spec support
- https://www.npmjs.com/package/@iarna/toml — TOML parser last publish date
- https://www.npmjs.com/package/tap — TAP test runner current version

---
*Stack research for: Codex CLI integration for /gsd workflows*
*Researched: 2026-01-27*
