# Architecture Research

**Domain:** CLI command/skill installer for multi-runtime AI agents (Claude Code, OpenCode, Codex CLI)
**Researched:** 2026-01-27
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      Content Source (Repo)                                │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐  ┌───────────┐  ┌───────────┐       │
│  │ commands/   │  │ get-shit-done/  │  │ agents/   │  │ hooks/    │       │
│  └──────┬──────┘  └────────┬────────┘  └─────┬─────┘  └─────┬─────┘       │
│         │                  │                │              │             │
├─────────┴──────────────────┴────────────────┴──────────────┴─────────────┤
│                        Installer Core (Node)                              │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────────────────┐ │
│  │ Runtime     │  │ Transformer      │  │ Config Writer                 │ │
│  │ Adapters    │  │ Pipeline         │  │ (settings.json / config.toml) │ │
│  └────┬────────┘  └──────────┬───────┘  └──────────────┬────────────────┘ │
│       │                      │                          │                  │
├───────┴──────────────────────┴──────────────────────────┴─────────────────┤
│                      Runtime Install Targets                              │
├───────────────┬───────────────────────┬──────────────────────────────────┤
│ Claude Code   │ OpenCode              │ Codex CLI                         │
│ ~/.claude     │ ~/.config/opencode    │ ~/.codex / .codex                 │
│ commands/gsd  │ command/gsd-*.md      │ .codex/skills/gsd-*/SKILL.md       │
│ settings.json │ opencode.json         │ config.toml + AGENTS.md           │
└───────────────┴───────────────────────┴──────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Content source | Canonical /gsd commands, workflows, templates, agents, hooks | `commands/`, `get-shit-done/`, `agents/`, `hooks/` in repo |
| Installer core | CLI entrypoint, runtime selection, install/uninstall orchestration | `bin/install.js` |
| Transformer pipeline | Convert content into runtime-specific formats | Claude frontmatter -> OpenCode tools; command flattening; Codex SKILL.md generation |
| Runtime adapters | Per-runtime paths, file layout, config wiring | `claude`, `opencode`, `codex` install handlers |
| Config writer | Update runtime config files without breaking existing behavior | `settings.json`, `opencode.json`, `~/.codex/config.toml` |
| Parity test harness | Execute same /gsd flows and compare artifacts | New test runner + fixtures |

## Recommended Project Structure

```
bin/
└── install.js                # Installer entrypoint (existing)
lib/
├── install/
│   ├── core.js                # Shared install orchestration
│   └── runtimes/
│       ├── claude.js           # Claude Code adapter
│       ├── opencode.js         # OpenCode adapter
│       └── codex.js            # Codex CLI adapter (new)
├── transform/
│   ├── claude-to-opencode.js   # Existing frontmatter conversion
│   ├── flatten-commands.js     # OpenCode command flattening
│   └── codex-skills.js         # New: SKILL.md generation + path rewrite
└── config/
    ├── claude.js               # settings.json helpers
    ├── opencode.js             # opencode.json helpers
    └── codex.js                # config.toml + AGENTS.md helpers
tests/
└── parity/
    ├── fixtures/               # Expected outputs for /gsd flows
    └── runners/                # Claude/OpenCode/Codex runners
```

### Structure Rationale

- **lib/install/**: isolates runtime differences so Codex can be additive without touching existing Claude/OpenCode logic.
- **lib/transform/**: keeps content canonical while emitting per-runtime formats, avoiding drift in /gsd behavior.

## Architectural Patterns

### Pattern 1: Runtime Adapter Pattern

**What:** Each runtime has a thin adapter that declares paths, config files, and content mapping rules.
**When to use:** Adding Codex integration while preserving existing Claude/OpenCode behavior.
**Trade-offs:** Slight indirection; fewer regressions and clearer separation.

**Example:**
```typescript
const runtimeAdapters = {
  claude: { rootDir, installCommands, writeSettings },
  opencode: { rootDir, installCommands, writeOpencodeConfig },
  codex: { rootDir, installSkills, writeCodexConfig },
};
```

### Pattern 2: Content Transformation Pipeline

**What:** Use a single canonical command/workflow source, then transform to runtime-specific formats at install time.
**When to use:** Codex CLI requires `SKILL.md` folders, while OpenCode uses flattened commands and Claude uses nested commands.
**Trade-offs:** Requires converters; avoids forking content and keeps parity checks straightforward.

**Example:**
```typescript
const content = readCommand("commands/gsd/help.md");
const codexSkill = toCodexSkill(content, { name: "gsd-help" });
writeSkill(".codex/skills/gsd-help/SKILL.md", codexSkill);
```

### Pattern 3: Config Layering via Native Config Files

**What:** Use each runtime's native config files and scopes (global + repo) instead of custom state.
**When to use:** Codex CLI supports `~/.codex/config.toml` and `.codex/config.toml` with skill locations and AGENTS.md layering.
**Trade-offs:** Requires careful merge logic to avoid overriding user settings.

## Data Flow

### Request Flow (Install)

```
User runs npx get-shit-done-cc
    ↓
Installer picks runtimes → Adapter chooses paths
    ↓
Transformer emits runtime format (Claude commands / OpenCode flat / Codex skills)
    ↓
Write runtime config (settings.json / opencode.json / config.toml)
    ↓
Verification + parity fixtures update (for Codex support)
```

### State Management

```
Canonical content (repo) → Transform outputs → Runtime install directories
```

### Key Data Flows

1. **Codex command mapping:** `commands/gsd/*.md` → `.codex/skills/gsd-*/SKILL.md` + references/templates.
2. **Instruction layering:** Global `~/.codex/AGENTS.md` + repo `AGENTS.md` used by Codex to understand /gsd workflows.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolithic installer with runtime adapters is sufficient. |
| 1k-100k users | Add install-time validation + parity smoke tests across runtimes. |
| 100k+ users | Add versioned migration steps for config files to avoid breaking existing installs. |

### Scaling Priorities

1. **First bottleneck:** Content drift across runtimes. Fix with automated parity tests and single-source transforms.
2. **Second bottleneck:** Config collisions. Fix with merge-safe config writers and idempotent installs.

## Anti-Patterns

### Anti-Pattern 1: Forking /gsd content per runtime

**What people do:** Copy and customize separate Codex/Claude/OpenCode command sets.
**Why it's wrong:** Parity breaks silently and tests become brittle.
**Do this instead:** Keep canonical content and convert it per runtime at install time.

### Anti-Pattern 2: Hard-coded Codex config paths

**What people do:** Assume `~/.codex` without honoring `CODEX_HOME` or project-scoped `.codex/` overrides.
**Why it's wrong:** Breaks multi-profile setups and repo-local installs.
**Do this instead:** Use Codex config precedence and allow global + repo scopes.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Codex CLI | File-based skills + config.toml + AGENTS.md | Codex loads skills from `~/.codex/skills` or `.codex/skills` and config from `~/.codex/config.toml` or `.codex/config.toml`. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Installer core ↔ Runtime adapters | Function calls + shared interfaces | Add Codex adapter without touching existing Claude/OpenCode logic. |
| Transformer ↔ Content source | File reads + path rewrite rules | Single canonical content transformed to runtime-specific formats. |
| Parity tests ↔ Runtime adapters | CLI execution + artifact diff | Use runtime adapters to execute /gsd flows in each CLI. |

## Suggested Build Order (for roadmap)

1. **Codex runtime adapter + paths** (global `~/.codex`, repo `.codex/`).
2. **Codex content transformer** (commands → skills, path replacement, frontmatter mapping).
3. **Codex config integration** (config.toml updates, AGENTS.md placement or guidance).
4. **Parity test harness** (Codex vs Claude/OpenCode output comparison).
5. **Installer UX additions** (runtime selection + uninstall support for Codex).

## Sources

- https://github.com/openai/codex (Codex CLI repo and installation info)
- https://developers.openai.com/codex/cli (Codex CLI overview)
- https://developers.openai.com/codex/cli/slash-commands (built-in slash commands)
- https://developers.openai.com/codex/config-reference (config.toml scopes and keys)
- https://developers.openai.com/codex/skills (skills format and locations)
- https://developers.openai.com/codex/skills/create-skill (SKILL.md structure)
- https://developers.openai.com/codex/guides/agents-md (AGENTS.md instruction layering)

---
*Architecture research for: Codex CLI integration of /gsd workflows*
*Researched: 2026-01-27*
