# Codebase Concerns

**Analysis Date:** 2026-01-27

## Tech Debt

**Installer script is monolithic and multi-responsibility:**
- Issue: CLI parsing, filesystem ops, content transforms, and settings writes live in one 1,000+ line file.
- Files: `bin/install.js`
- Impact: Hard to test, reason about, and modify safely; higher risk of regressions during updates.
- Fix approach: Split into modules (arg parsing, filesystem install/uninstall, content transforms, settings mutation) and add unit tests around each module.

**Hand-rolled frontmatter parsing is brittle:**
- Issue: Frontmatter conversion assumes simple YAML and line-by-line parsing.
- Files: `bin/install.js`, `commands/gsd/help.md`
- Impact: New frontmatter formats (multiline, nested, or complex YAML) can be mangled or dropped during OpenCode conversion.
- Fix approach: Use a YAML parser or enforce a strict frontmatter schema and validate before conversion.

## Known Bugs

**Hooks missing when installing from source without build step:**
- Symptoms: Statusline/update hook commands point to files that do not exist; statusline or update checks silently fail.
- Files: `bin/install.js`, `scripts/build-hooks.js`, `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`
- Trigger: Installing directly from repo without running `npm run build:hooks` (missing `hooks/dist`).
- Workaround: Run `npm run build:hooks` before install or rely on published package with `prepublishOnly`.

## Security Considerations

**Automatic permission expansion for OpenCode:**
- Risk: Grants `read` and `external_directory` permissions to the GSD directory without explicit confirmation.
- Files: `bin/install.js`
- Current mitigation: None (silent write to `opencode.json`).
- Recommendations: Prompt before modifying permissions and show the exact paths to be added.

## Performance Bottlenecks

**Statusline repeatedly scans filesystem:**
- Problem: Each statusline render scans `.claude/todos` and parses JSON synchronously.
- Files: `hooks/gsd-statusline.js`
- Cause: `readdirSync`, `statSync`, `readFileSync` per render.
- Improvement path: Add in-memory cache with TTL or memoize per session update file.

**Update check spawns network call per session:**
- Problem: SessionStart hook always spawns `npm view`, which can be slow on constrained networks.
- Files: `hooks/gsd-check-update.js`
- Cause: Background process uses `execSync` without reusing cached results.
- Improvement path: Add minimum interval check (e.g., 24h) using cached `checked` timestamp.

## Fragile Areas

**Invalid JSON wipes user settings:**
- Files: `bin/install.js`
- Why fragile: `readSettings` returns `{}` on parse error and later overwrites `settings.json`, losing user configuration.
- Safe modification: Preserve original file on parse error or back it up before write.
- Test coverage: None (no tests for settings migration).

**Install deletes and recreates GSD directories:**
- Files: `bin/install.js`
- Why fragile: `copyWithPathReplacement` removes destination directories recursively; local custom edits under `commands/gsd/` or `get-shit-done/` are lost.
- Safe modification: Warn before destructive replace or support patch/merge updates.
- Test coverage: None (no install/uninstall fixtures).

**Orphan cleanup can abort on permission errors:**
- Files: `bin/install.js`
- Why fragile: `fs.unlinkSync`/`fs.rmSync` calls are not wrapped; a single permission error can crash install.
- Safe modification: Catch and report per-file errors, continue with install.
- Test coverage: None (no error-path tests).

## Scaling Limits

**Not detected:**
- No explicit scaling configuration or workload limits in `bin/install.js`.

## Dependencies at Risk

**Not detected:**
- No external runtime dependencies listed in `package.json`.

## Missing Critical Features

**Not detected:**
- No critical feature gaps referenced in shipped documentation; confirm against roadmap in `README.md`.

## Test Coverage Gaps

**No automated tests present:**
- What's not tested: Installer logic, file transforms, settings migration, hooks behavior.
- Files: `bin/install.js`, `scripts/build-hooks.js`, `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`
- Risk: Regressions in install/update flow go unnoticed.
- Priority: High

---

*Concerns audit: 2026-01-27*
