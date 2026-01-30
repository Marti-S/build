---
status: complete
phase: 01-codex-repo-integration
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md]
started: 2026-01-27T16:08:10Z
updated: 2026-01-27T16:47:45Z
---

## Current Test

[testing complete]

## Tests

### 1. Codex local install creates skills + AGENTS guidance
expected: Running `node bin/install.js --codex --local` in repo root creates `.codex/skills/gsd-*` with `SKILL.md` and updates/creates repo-root `AGENTS.md` including the GSD marker block.
result: pass

### 2. Skill frontmatter parity for gsd-help
expected: `.codex/skills/gsd-help/SKILL.md` frontmatter `name` and `description` match `commands/gsd/help.md` exactly.
result: pass

### 3. Codex uninstall cleans repo artifacts
expected: Running `node bin/install.js --codex --local --uninstall` removes `.codex/skills/gsd-*` and removes the GSD marker block from `AGENTS.md` (delete the file if it only contained the GSD block).
result: pass

### 4. Codex local-only enforcement
expected: `node bin/install.js --codex --global` or `--codex --config-dir <path>` exits with a clear error and does not install.
result: pass

### 5. README Codex guidance
expected: README includes Codex install/uninstall examples and mentions `.codex/skills` and `AGENTS.md` repo scope.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
