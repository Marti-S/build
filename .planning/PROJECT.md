# get-shit-done-cc Codex Support

## What This Is

An npm package that installs the /gsd command suite, workflows, and templates into Claude Code and OpenCode. This project extends that same package to install and run the identical /gsd command set inside the Codex CLI, so Codex users get the same planning and execution experience. Parity is defined against the current ClaudeCode behavior in this repo.

## Core Value

Codex CLI users can run any /gsd command end-to-end with the same artifacts and behavior as ClaudeCode.

## Requirements

### Validated

- ✓ Install /gsd commands and workflows into Claude Code/OpenCode config directories — existing
- ✓ Provide Markdown-based workflows/templates consumed by commands — existing
- ✓ Install Claude Code hooks for statusline/update checks — existing
- ✓ Convert commands for OpenCode during install — existing

### Active

- [ ] Detect Codex CLI install target and install the same /gsd commands/workflows/templates
- [ ] All /gsd commands execute in Codex CLI with identical artifact outputs and behavior
- [ ] Automated parity tests compare Codex outputs to ClaudeCode outputs
- [ ] Installer changes are additive and preserve existing Claude/OpenCode behavior

### Out of Scope

- New /gsd commands — scope is parity only
- Behavior changes for Claude/OpenCode commands — keep existing behavior stable
- External services or new infrastructure — keep package self-contained

## Context

The current package (`get-shit-done-cc`) installs /gsd commands, workflows, templates, and hooks into Claude Code and OpenCode via a Node.js installer. Codex CLI integration does not exist today, so users on Codex are blocked from /gsd workflows. The Codex CLI is expected to handle model selection; this work focuses on wiring /gsd support into Codex using the same package. Automated parity testing will be introduced (no test framework is present today).

## Constraints

- **Tech stack**: Node.js >=16.7.0 and Markdown-based command/workflow system — preserve existing architecture
- **Compatibility**: Additive-only changes for Claude/OpenCode — avoid regressions
- **External dependencies**: No new services — keep package self-contained
- **Verification**: Automated parity tests required — part of this milestone

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Exact parity with current ClaudeCode behavior | Consistent UX across CLIs | — Pending |
| Support Codex CLI + OpenCode via the same package | Single distribution and install path | — Pending |
| Extend existing npm package (`get-shit-done-cc`) | Reuse installer and content structure | — Pending |
| Codex model selection handled by Codex CLI | Keep /gsd model-agnostic | — Pending |

---
*Last updated: 2026-01-27 after initialization*
