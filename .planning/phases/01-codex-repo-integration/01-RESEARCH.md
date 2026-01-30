# Phase 1: Codex Repo Integration - Research

**Researched:** 2026-01-27
**Domain:** Codex CLI repo-scoped skills and AGENTS.md guidance
**Confidence:** HIGH

## Summary

This research focused on how Codex CLI discovers repo-scoped skills and project guidance, and how those mechanisms should be used to mirror current Claude/OpenCode behavior without adding new commands or external services. The Codex docs confirm that skills are discovered from `.codex/skills` at repo scope, each skill is defined by a `SKILL.md` file with required `name` and `description` fields, and Codex loads only the skill name/description at startup (full instructions load only when invoked). The AGENTS.md docs define how project guidance is layered, including override precedence and size limits.

For planning Phase 1, the standard approach is: install one SKILL per GSD command under `.codex/skills/<skill>/SKILL.md`, and install a repo-root `AGENTS.md` with project guidance. Skills should use the command’s existing frontmatter `name`/`description` to align with `/gsd` commands, while the instruction body can reference the existing GSD workflows/templates already shipped. Avoid user-level config edits; Codex project-scoped `.codex/config.toml` is only loaded when a project is trusted, so the plan should not depend on it.

**Primary recommendation:** Create repo-scoped Codex skills at `.codex/skills/*/SKILL.md` that mirror `commands/gsd/*.md` `name`/`description`, and add a repo-root `AGENTS.md` that matches existing GSD guidance while relying on Codex’s built-in discovery rules.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Codex CLI (`@openai/codex`) | latest | Loads skills and AGENTS.md for repo guidance | Official CLI with defined skill/AGENTS discovery rules | 
| Codex skill format (`SKILL.md`) | current spec | Defines skill metadata and instructions | Required format Codex loads and validates |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| AGENTS.md project guidance | current spec | Layered project instructions | Repo-level guidance required by phase |
| `.codex/config.toml` (project) | current spec | Project-scoped config overrides | Only if trusted project and required by future phases |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `AGENTS.md` | `model_instructions_file` in config | Requires config edits and trust; conflicts with constraint to avoid user-level config edits |

**Installation:**
```bash
npm i -g @openai/codex
```

## Architecture Patterns

### Recommended Project Structure
```
.codex/
├── skills/
│   ├── gsd-help/
│   │   └── SKILL.md
│   ├── gsd-plan-phase/
│   │   └── SKILL.md
│   └── ...
AGENTS.md
```

### Pattern 1: Repo-Scoped Skills with SKILL.md
**What:** One skill per `/gsd` command, stored in `.codex/skills/<skill-name>/SKILL.md` with required `name` and `description` fields and optional instructions. Codex loads only name/description at startup and injects full instructions only when invoked.
**When to use:** Always for repo-scoped skills; required by CODEX-01 and CODEX-02.
**Example:**
```markdown
---
name: draft-commit-message
description: Draft a conventional commit message when the user asks for help writing a commit message.
metadata:
  short-description: Draft an informative commit message.
---

Draft a conventional commit message that matches the change summary provided by the user.
```
// Source: https://developers.openai.com/codex/skills/create-skill

### Pattern 2: Layered AGENTS.md Guidance
**What:** Place a repo-root `AGENTS.md` with project guidance. Codex builds an instruction chain from global and project files, honoring override precedence and size limits.
**When to use:** Always for repo-level guidance (CODEX-03).
**Example:**
```markdown
# AGENTS.md

## Repository expectations

- Run `npm run lint` before opening a pull request.
- Document public utilities in `docs/` when you change behavior.
```
// Source: https://developers.openai.com/codex/guides/agents-md

### Anti-Patterns to Avoid
- **Missing or invalid SKILL.md:** Codex ignores skills without proper `SKILL.md` or valid YAML frontmatter; ensure required `name`/`description` and length limits.
- **Relying on project config without trust:** `.codex/config.toml` is only loaded when the project is trusted; plan should not depend on it for core behavior.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skill discovery and selection | Custom indexing or CLI wrappers | Codex `.codex/skills` discovery | Codex already loads skills by path and precedence |
| Project guidance layering | Custom prompt concatenation | AGENTS.md discovery chain | Codex handles override order and size limits |

**Key insight:** Codex already defines skill discovery paths and instruction layering. Reimplementing these rules in the installer adds divergence risk and breaks “exact parity with current ClaudeCode behavior.”

## Common Pitfalls

### Pitfall 1: Invalid SKILL.md metadata
**What goes wrong:** Skills don’t load or trigger because `name`/`description` are missing, multi-line, or exceed length limits.
**Why it happens:** SKILL.md frontmatter is strict and Codex validates on startup.
**How to avoid:** Keep `name` and `description` single-line; follow Codex limits (name ≤ 100 chars, description ≤ 500 chars).
**Warning signs:** Skill missing from `/skills` list or Codex reports validation errors on startup.

### Pitfall 2: Skills placed outside supported paths
**What goes wrong:** Codex fails to discover repo skills.
**Why it happens:** Skills must live under `.codex/skills` at repo scope.
**How to avoid:** Always install into `.codex/skills/<skill>/SKILL.md` (repo root or parent folder per Codex discovery rules).
**Warning signs:** Skill folder exists but does not appear in Codex skills list.

### Pitfall 3: Assuming project config always loads
**What goes wrong:** `.codex/config.toml` settings are ignored, leading to unexpected behavior.
**Why it happens:** Codex only loads project-scoped config when the project is trusted.
**How to avoid:** Keep core integration independent of project config; document trust requirement if config is needed.
**Warning signs:** Codex ignores settings in `.codex/config.toml` until the project is marked trusted.

### Pitfall 4: AGENTS.md overrides not behaving as expected
**What goes wrong:** Guidance appears in the wrong order or is missing.
**Why it happens:** `AGENTS.override.md` takes precedence and Codex only includes one file per directory, with size caps.
**How to avoid:** Place repo-level guidance in `AGENTS.md` and avoid higher-level overrides that mask it; keep within `project_doc_max_bytes`.
**Warning signs:** Codex reports different instruction sources than expected or guidance is truncated.

## Code Examples

Verified patterns from official sources:

### Repo-Scoped Skill Folder
```markdown
---
name: <skill-name>
description: <what it does and when to use it>
---

<instructions, references, or examples>
```
// Source: https://developers.openai.com/codex/skills/create-skill

### AGENTS.md Layering (Repo Guidance)
```markdown
# AGENTS.md

## Repository expectations

- Run `npm run lint` before opening a pull request.
- Document public utilities in `docs/` when you change behavior.
```
// Source: https://developers.openai.com/codex/guides/agents-md

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Not specified in Codex docs | Layered instructions via AGENTS.md and repo-scoped skills | N/A (docs do not specify historical change) | Enables per-repo guidance without user-level config edits |

**Deprecated/outdated:**
- None identified in current Codex docs for skills/AGENTS.md.

## Open Questions

1. **Do repo-scoped skills load for untrusted projects?**
   - What we know: Project-scoped `.codex/config.toml` only loads when the project is trusted.
   - What's unclear: Whether skills under `.codex/skills` are skipped for untrusted projects.
   - Recommendation: Validate with Codex CLI on an untrusted repo before making skill availability depend on trust.

2. **Is skill discovery affected by `project_root_markers`?**
   - What we know: Codex determines project root using markers in config and then walks to CWD for AGENTS.md layering.
   - What's unclear: Whether non-standard repo roots impact which `.codex/skills` location is considered the repo root.
   - Recommendation: Test against a repo with custom root markers if this project uses them.

## Sources

### Primary (HIGH confidence)
- https://developers.openai.com/codex/skills - skill locations, precedence, and SKILL.md requirement
- https://developers.openai.com/codex/skills/create-skill - SKILL.md format, metadata constraints, and loading behavior
- https://developers.openai.com/codex/guides/agents-md - AGENTS.md discovery, precedence, and limits
- https://developers.openai.com/codex/config-basic - config precedence and trusted-project requirement for project config
- https://developers.openai.com/codex/cli - Codex CLI install and overview

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - codex docs define skills and AGENTS.md
- Architecture: HIGH - patterns sourced directly from official docs
- Pitfalls: HIGH - pitfalls derived from official validation and discovery rules

**Research date:** 2026-01-27
**Valid until:** 2026-02-26
