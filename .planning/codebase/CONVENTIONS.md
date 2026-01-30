# Coding Conventions

**Analysis Date:** 2026-01-27

## Naming Patterns

**Files:**
- Kebab-case for markdown and scripts (e.g., `commands/gsd/execute-phase.md`, `get-shit-done/workflows/execute-phase.md`, `hooks/gsd-statusline.js`).

**Functions:**
- lowerCamelCase for JS helpers and utilities (e.g., `getGlobalDir`, `convertToolName`, `install` in `bin/install.js`).

**Variables:**
- lowerCamelCase for locals; UPPER_SNAKE_CASE for constants (e.g., `HOOKS_DIR`, `DIST_DIR` in `scripts/build-hooks.js`).

**Types:**
- Not applicable (JavaScript-only; no TypeScript types detected in `bin/install.js`, `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`).

## Code Style

**Formatting:**
- 2-space indentation, semicolons, and single quotes in Node scripts (e.g., `bin/install.js`, `hooks/gsd-statusline.js`).
- Shebang for CLI entry points: `#!/usr/bin/env node` (e.g., `bin/install.js`, `hooks/gsd-check-update.js`).

**Linting:**
- Not detected (no `eslint` or `prettier` config files; see root for absence).

## Import Organization

**Order:**
1. Node built-ins first (`fs`, `path`, `os`, `child_process`) as in `bin/install.js`, `hooks/gsd-check-update.js`.
2. Local/project requires after built-ins (e.g., `require('../package.json')` in `bin/install.js`).
3. Inline requires inside spawned scripts when needed (e.g., `hooks/gsd-check-update.js`).

**Path Aliases:**
- Not detected (no alias config or usage; imports are relative or built-in in `bin/install.js`).

## Error Handling

**Patterns:**
- Guard clauses + `console.error` + `process.exit(1)` for invalid CLI input (e.g., `bin/install.js`).
- Silent failure for non-critical reads/parses (empty `catch` blocks in `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`).
- Warnings for recoverable issues (`console.warn` in `scripts/build-hooks.js`).

## Logging

**Framework:** console

**Patterns:**
- Use ANSI color constants for CLI output (e.g., `bin/install.js`).
- Log progress for file operations (e.g., `scripts/build-hooks.js`).

## Comments

**When to Comment:**
- Use section headers and intent comments for non-obvious steps (e.g., `hooks/gsd-statusline.js`, `bin/install.js`).
- Prefer concise “why/what” comments over narrative.

**JSDoc/TSDoc:**
- JSDoc blocks for functions, with `@param` and purpose notes (e.g., `bin/install.js`).

## Function Design

**Size:**
- Small, single-purpose helpers with clear naming and doc blocks (e.g., `getGlobalDir`, `writeSettings`, `copyWithPathReplacement` in `bin/install.js`).

**Parameters:**
- Explicit parameter lists with JSDoc types where helpful (`bin/install.js`).

**Return Values:**
- Return booleans/objects for validation and flow control (e.g., `verifyInstalled`, `install` in `bin/install.js`).

## Module Design

**Exports:**
- CLI scripts are run directly; no module exports used in `bin/install.js`, `hooks/gsd-statusline.js`.

**Barrel Files:**
- Not applicable (no module barrels detected).

## Documentation & Prompt Conventions

**Frontmatter:**
- YAML frontmatter for commands with `name`, `description`, and `allowed-tools` (e.g., `commands/gsd/execute-phase.md`, `commands/gsd/help.md`).

**Structure Tags:**
- XML-style semantic containers use snake_case with underscores (e.g., `<execution_context>`, `<success_criteria>` in `commands/gsd/execute-phase.md`; `<required_reading>` in `get-shit-done/workflows/execute-phase.md`).

**Voice & tone:**
- Imperative, concise, no filler and no temporal language (guidance in `GSD-STYLE.md`, `CONTRIBUTING.md`).

---

*Convention analysis: 2026-01-27*
