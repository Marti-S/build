# Codebase Structure

**Analysis Date:** 2026-01-27

## Directory Layout

```
[project-root]/
├── agents/               # Subagent definitions (Markdown)
├── assets/               # Images used in README/docs
├── bin/                  # CLI installer entry point
├── commands/             # Slash command definitions
│   └── gsd/              # GSD command namespace
├── get-shit-done/        # Workflows, templates, references
│   ├── workflows/        # Orchestrator logic per command
│   ├── templates/        # Output templates
│   │   ├── codebase/      # Codebase mapping templates
│   │   └── research-project/ # Research templates
│   └── references/       # Shared reference guides
├── hooks/                # Claude Code hooks (source)
├── scripts/              # Build utilities
├── package.json          # Package metadata and bin mapping
└── README.md             # Project overview and usage
```

## Directory Purposes

**agents/**
- Purpose: Define subagent roles used by workflows.
- Contains: Markdown agent prompts (`agents/gsd-codebase-mapper.md`, `agents/gsd-executor.md`).
- Key files: `agents/gsd-codebase-mapper.md`, `agents/gsd-executor.md`.

**bin/**
- Purpose: Package entry point for installation.
- Contains: CLI installer script (`bin/install.js`).
- Key files: `bin/install.js`.

**commands/gsd/**
- Purpose: Slash command definitions loaded by Claude/OpenCode.
- Contains: One Markdown file per command (`commands/gsd/new-project.md`, `commands/gsd/execute-phase.md`).
- Key files: `commands/gsd/help.md`, `commands/gsd/map-codebase.md`, `commands/gsd/execute-phase.md`.

**get-shit-done/workflows/**
- Purpose: Orchestrator logic for each command.
- Contains: Step-by-step processes (`get-shit-done/workflows/execute-phase.md`, `get-shit-done/workflows/map-codebase.md`).
- Key files: `get-shit-done/workflows/execute-phase.md`, `get-shit-done/workflows/map-codebase.md`.

**get-shit-done/templates/**
- Purpose: Output templates for planning artifacts and reports.
- Contains: Base templates (`get-shit-done/templates/summary.md`) and subfolders for codebase and research templates.
- Key files: `get-shit-done/templates/summary.md`, `get-shit-done/templates/codebase/architecture.md`.

**get-shit-done/references/**
- Purpose: Shared guidance and standards referenced by workflows.
- Contains: Reference Markdown files (`get-shit-done/references/tdd.md`, `get-shit-done/references/checkpoints.md`).
- Key files: `get-shit-done/references/tdd.md`, `get-shit-done/references/checkpoints.md`.

**hooks/**
- Purpose: Runtime hook scripts for Claude Code.
- Contains: Hook JS files (`hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`).
- Key files: `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`.

**scripts/**
- Purpose: Build utilities for packaging.
- Contains: Hook build script (`scripts/build-hooks.js`).
- Key files: `scripts/build-hooks.js`.

## Key File Locations

**Entry Points:**
- `bin/install.js`: CLI installer invoked by `npx get-shit-done-cc`.
- `scripts/build-hooks.js`: Copies hook sources into `hooks/dist/` for packaging.

**Configuration:**
- `package.json`: Package metadata, bin mapping, and build scripts.
- `get-shit-done/templates/config.json`: Default workflow config template.

**Core Logic:**
- `commands/gsd/*.md`: Command definitions for the GSD workflow.
- `get-shit-done/workflows/*.md`: Orchestrator logic invoked by commands.

**Runtime Hooks:**
- `hooks/gsd-statusline.js`: Statusline renderer.
- `hooks/gsd-check-update.js`: Update checker and cache writer.

**Testing:**
- Not applicable: no test directory or runner detected in this repository.

## Naming Conventions

**Files:**
- `gsd-*.md` for agent definitions (`agents/gsd-codebase-mapper.md`).
- `gsd-*.js` for hook scripts (`hooks/gsd-statusline.js`).
- Kebab-case for workflows and commands (`get-shit-done/workflows/execute-phase.md`, `commands/gsd/new-project.md`).

**Directories:**
- Lowercase with hyphen separators (`get-shit-done/`, `get-shit-done/references/`).

## Where to Add New Code

**New Command:**
- Primary code: `commands/gsd/{command}.md`
- Workflow: `get-shit-done/workflows/{command}.md`

**New Component/Module:**
- Template or reference: `get-shit-done/templates/{name}.md` or `get-shit-done/references/{name}.md`

**Utilities:**
- Installer or build utility: `bin/install.js` or `scripts/build-hooks.js`

**Hooks:**
- Implementation: `hooks/{hook-name}.js`
- Build inclusion: `scripts/build-hooks.js`
- Install wiring: `bin/install.js`

**Agent Role:**
- Definition: `agents/gsd-{role}.md`

## Special Directories

**hooks/dist/**
- Purpose: Build output for hook scripts packaged with the installer.
- Generated: Yes (via `scripts/build-hooks.js`).
- Committed: No (not present in repository by default).

---

*Structure analysis: 2026-01-27*
