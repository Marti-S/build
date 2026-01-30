# Architecture

**Analysis Date:** 2026-01-27

## Pattern Overview

**Overall:** Content-driven orchestration system with a Node.js installer and Markdown-defined commands/workflows.

**Key Characteristics:**
- Markdown command files define entrypoints and execution context in YAML frontmatter (`commands/gsd/help.md`, `commands/gsd/execute-phase.md`).
- Workflows and templates are Markdown artifacts consumed by commands and subagents (`get-shit-done/workflows/execute-phase.md`, `get-shit-done/templates/summary.md`).
- A Node.js installer copies and transforms content into Claude/OpenCode config directories (`bin/install.js`).

## Layers

**Installer & Packaging:**
- Purpose: Install GSD content into Claude/OpenCode directories and configure hooks/settings.
- Location: `bin/install.js`, `scripts/build-hooks.js`, `package.json`
- Contains: CLI argument parsing, file copying, path replacement, OpenCode frontmatter conversion, hook bundling.
- Depends on: Local filesystem, environment variables, Node.js runtime.
- Used by: `npx get-shit-done-cc` via `package.json` bin mapping.

**Command Layer:**
- Purpose: Define slash commands with frontmatter, objectives, and execution context.
- Location: `commands/gsd/*.md`
- Contains: YAML frontmatter, `<objective>`/`<process>` sections, execution context references.
- Depends on: Workflows and references (`get-shit-done/workflows/*.md`, `get-shit-done/references/*.md`).
- Used by: Claude Code/OpenCode command loader after installation.

**Workflow Layer:**
- Purpose: Orchestrator logic for each command (step-by-step execution flows).
- Location: `get-shit-done/workflows/*.md`
- Contains: Structured processes, bash snippets, and agent spawning rules.
- Depends on: Templates and references (`get-shit-done/templates/*.md`, `get-shit-done/references/*.md`).
- Used by: Command files via `@~/.claude/get-shit-done/workflows/...` references.

**Template & Reference Layer:**
- Purpose: Standardized output formats and guidance for agents.
- Location: `get-shit-done/templates/*.md`, `get-shit-done/templates/codebase/*.md`, `get-shit-done/templates/research-project/*.md`, `get-shit-done/references/*.md`
- Contains: Document templates and prescriptive rules for planning, execution, and verification.
- Depends on: None (content-only).
- Used by: Workflows and agents when writing `.planning/*` artifacts.

**Agent Definitions:**
- Purpose: Define subagent roles used by workflows.
- Location: `agents/gsd-*.md`
- Contains: Subagent-specific instructions and behaviors.
- Depends on: Workflows reference them via Task calls.
- Used by: Orchestrator workflows and commands (e.g., map-codebase spawns `gsd-codebase-mapper`).

**Runtime Hooks:**
- Purpose: Provide statusline output and background update checks in Claude Code.
- Location: `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`
- Contains: Hook scripts that read stdin JSON, read/write cache files, and spawn background processes.
- Depends on: `~/.claude` filesystem layout and Node.js runtime.
- Used by: Claude Code hook system configured by `bin/install.js`.

## Data Flow

**Installation Flow:**

1. CLI entry `bin/install.js` runs via `package.json` bin mapping.
2. Installer copies `commands/gsd/` and `get-shit-done/` into target config directories, replacing path references (`bin/install.js`).
3. Installer flattens commands for OpenCode, converts frontmatter/tool names, and writes settings/hooks (`bin/install.js`).
4. Hook files are copied from `hooks/dist/` (built by `scripts/build-hooks.js`) into target `hooks/`.

**Command Execution Flow:**

1. User runs a slash command (e.g., `/gsd:execute-phase`), backed by `commands/gsd/execute-phase.md`.
2. Command loads workflow context from `get-shit-done/workflows/execute-phase.md` and references templates/references.
3. Workflow spawns subagents using agent definitions in `agents/gsd-*.md` and writes artifacts in `.planning/*` using templates.

**Update Check Flow (Hook):**

1. `hooks/gsd-check-update.js` runs on session start and spawns a background process.
2. Background process reads installed `VERSION` and checks `npm view get-shit-done-cc version`, writing cache to `~/.claude/cache/gsd-update-check.json`.
3. `hooks/gsd-statusline.js` reads the cache and displays update indicator in the statusline.

**State Management:**
- Project state lives in `.planning/STATE.md` and config in `.planning/config.json` (referenced in workflows such as `get-shit-done/workflows/execute-phase.md`).

## Key Abstractions

**Command File:**
- Purpose: Defines a slash command, its intent, and execution context.
- Examples: `commands/gsd/map-codebase.md`, `commands/gsd/new-project.md`
- Pattern: YAML frontmatter + `<objective>/<process>` blocks; uses `@~/.claude/get-shit-done/...` references.

**Workflow File:**
- Purpose: Orchestrator logic and step-by-step operations.
- Examples: `get-shit-done/workflows/map-codebase.md`, `get-shit-done/workflows/execute-phase.md`
- Pattern: `<process>` with named steps, bash snippets, and agent spawning instructions.

**Template File:**
- Purpose: Output schema for planning and reporting documents.
- Examples: `get-shit-done/templates/summary.md`, `get-shit-done/templates/codebase/architecture.md`
- Pattern: Markdown templates with placeholders for agents to fill.

**Agent Definition:**
- Purpose: Role-specific guidance for subagents.
- Examples: `agents/gsd-codebase-mapper.md`, `agents/gsd-executor.md`
- Pattern: Prescriptive instructions, tool allowances, and output expectations.

## Entry Points

**CLI Installer:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-cc`
- Responsibilities: Install commands/workflows/templates, configure hooks and settings.

**Hook Scripts:**
- Location: `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`
- Triggers: Claude Code hook events (status line render, session start).
- Responsibilities: Statusline rendering and update checks.

**Primary Commands:**
- Location: `commands/gsd/new-project.md`, `commands/gsd/execute-phase.md`, `commands/gsd/map-codebase.md`
- Triggers: Slash commands in Claude Code/OpenCode.
- Responsibilities: Route to workflows and spawn agents.

## Error Handling

**Strategy:** Fail-fast in installer, fail-safe in hooks.

**Patterns:**
- Installer validates CLI arguments and exits with errors on invalid combinations (`bin/install.js`).
- Hook scripts wrap JSON parsing and file reads in try/catch and fail silently to avoid breaking the UI (`hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`).

## Cross-Cutting Concerns

**Logging:** Console output for installer and build scripts (`bin/install.js`, `scripts/build-hooks.js`).
**Validation:** Existence checks for directories/files before install/copy (`bin/install.js`).
**Authentication:** Not applicable (no auth layer in repository; content only).

---

*Architecture analysis: 2026-01-27*
