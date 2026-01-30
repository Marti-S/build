# Phase 2: Codex Parity Execution - Research

**Researched:** 2026-01-27
**Domain:** Codex CLI command parity for /gsd via skills + repo-scoped guidance
**Confidence:** MEDIUM

## Summary

This phase is about making Codex CLI execute the existing /gsd command flows with the same .planning artifacts as Claude/OpenCode, without touching existing Claude/OpenCode installs. The current Codex integration already generates repo-scoped skills and an AGENTS.md block; parity now hinges on ensuring Codex loads the same command instructions and runs the same orchestrator-style flows that live in `commands/gsd/*.md`.

The Codex CLI standard stack for this is: repo-scoped skills in `.codex/skills/` (each with `SKILL.md`), repo-scoped guidance via `AGENTS.md`, and (if needed) project-scoped overrides in `.codex/config.toml` instead of user config. Codex supports explicit or implicit skill invocation and uses AGENTS discovery rules to layer instructions from global → repo → subdir. The safest parity approach is to treat `commands/gsd/*.md` as the single source of truth and ensure each Codex skill or session always reads and follows that file before executing the command.

Key planning implications: do not add custom slash-command mechanics (Codex slash commands are built-in), and do not write to user-level Codex config. Use the Codex skill format and AGENTS discovery rules, and verify parity by comparing the produced `.planning/` artifacts (structure/fields) rather than console wording. Watch for trust and instruction-loading pitfalls: project config only loads in trusted repos, skills only inject full instructions when invoked, and AGENTS has a size cap.

**Primary recommendation:** Treat `commands/gsd/*.md` as canonical and ensure Codex skills or AGENTS instructions explicitly load and follow that file on every /gsd invocation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Codex CLI (`@openai/codex`) | 0.92.0 | Local CLI agent that runs tasks in a repo | Official Codex client; supports skills, AGENTS discovery, and project config layers. Source: https://github.com/openai/codex/releases/tag/rust-v0.92.0 |
| Codex Skills (`.codex/skills/*/SKILL.md`) | bundled | Define reusable agent behaviors | Official skill system for CLI; supports repo-scoped skills and explicit/implicit invocation. Source: https://developers.openai.com/codex/skills |
| AGENTS.md instructions | bundled | Repo-scoped guidance for Codex | Official instructions discovery and layering for Codex. Source: https://developers.openai.com/codex/guides/agents-md |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `.codex/config.toml` | bundled | Project-scoped Codex settings | Use for repo-only settings (approval/sandbox, fallback filenames) without touching user config. Source: https://developers.openai.com/codex/config-basic |
| Codex Rules (`~/.codex/rules/*.rules`) | bundled | Command allow/prompt/deny policies | Use only if parity requires consistent command approvals; avoid custom approval logic. Source: https://developers.openai.com/codex/rules |
| `codex exec` | bundled | Non-interactive runs for automation/tests | Use for parity checks or scripted comparisons. Source: https://developers.openai.com/codex/noninteractive |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Repo-scoped skills | User-level skills in `~/.codex/skills` | Violates parity requirement (must not alter existing installs); harder to keep repo-specific behavior. |
| AGENTS.md | `model_instructions_file` in user config | Requires user-level config change; violates requirement to leave existing installs unchanged. |
| Skills system | Custom slash-command wrapper | Codex slash commands are built-in; custom wrappers add brittleness and drift. |

**Installation:**
```bash
npm install -g @openai/codex
```

## Architecture Patterns

### Recommended Project Structure
```
.codex/
├── skills/
│   ├── gsd-*/
│   │   └── SKILL.md
│   └── ...
└── config.toml           # optional, repo-scoped overrides

AGENTS.md                 # repo guidance loaded by Codex
commands/
└── gsd/
    └── *.md              # canonical command instructions
```

### Pattern 1: Command-as-Skill, Command File as Source of Truth
**What:** Each `/gsd:*` command is represented by a Codex skill whose instructions direct Codex to load the matching `commands/gsd/*.md` file and follow its objective/process/output rules.
**When to use:** Always; this is how to keep Codex parity with Claude/OpenCode without duplicating logic.
**Example:**
```markdown
---
name: gsd:plan-phase
description: Create detailed execution plan for a phase (PLAN.md) with verification loop
---

You are the `gsd:plan-phase` command for this repository.
Load and follow `commands/gsd/plan-phase.md` as the canonical behavior definition.
```
Source: https://developers.openai.com/codex/skills

### Pattern 2: Repo-Scoped Guidance via AGENTS.md
**What:** Keep Codex guidance in repo-root `AGENTS.md` so Codex loads it automatically and without touching user-level config.
**When to use:** Always; aligns with parity requirement (no changes to existing Claude/OpenCode installs).
**Example:**
```markdown
# AGENTS.md

## Repository expectations

- Use /gsd commands for planning and execution in this repo.
- Follow each command's objective, workflow, and output constraints.
```
Source: https://developers.openai.com/codex/guides/agents-md

### Pattern 3: Project-Scoped Config Overrides (Optional)
**What:** Use `.codex/config.toml` to set Codex defaults for this repo (approval policy, sandbox mode, fallback filenames).
**When to use:** Only if parity requires specific config settings and must stay repo-scoped.
**Example:**
```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"

project_doc_fallback_filenames = ["AGENTS.md"]
```
Source: https://developers.openai.com/codex/config-basic

### Anti-Patterns to Avoid
- **Custom slash commands:** Codex slash commands are built-in; rely on skills and instructions instead.
- **User-level config writes:** Editing `~/.codex/config.toml` or `~/.codex/skills` breaks the “no existing installs changed” requirement.
- **Duplicating command logic:** Copy/pasting command behavior into multiple locations increases drift; use `commands/gsd/*.md` as canonical.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command discovery and routing | Custom parser for `/gsd:*` | Codex skills + AGENTS.md | Skills are the official mechanism for reusable workflows; AGENTS provides repo guidance without user config changes. |
| Approval/sandbox gating | Custom allow/deny logic | Codex approval + rules | Built-in approvals and rules system already enforce safety policies. |
| Repo-only configuration | Ad-hoc env vars/scripts | `.codex/config.toml` | Codex supports project-scoped config with precedence and trust checks. |

**Key insight:** Codex already provides skills, instruction discovery, and config layering; parity should reuse these rather than adding a new command system.

## Common Pitfalls

### Pitfall 1: Skills loaded but instructions never invoked
**What goes wrong:** Codex sees the skill metadata but doesn’t load the full instructions, so it never reads the command file and drifts from parity.
**Why it happens:** Skill bodies are only injected on explicit/implicit invocation; skill descriptions may be too generic to auto-trigger.
**How to avoid:** Make skill instructions explicitly load the matching `commands/gsd/*.md` file and ensure AGENTS guidance reinforces this. Use explicit invocation in parity tests.
**Warning signs:** Codex outputs correct-sounding but structurally different `.planning` artifacts.

### Pitfall 2: Project config ignored due to trust
**What goes wrong:** `.codex/config.toml` is silently ignored, so expected approval/sandbox or fallback filename behavior doesn’t apply.
**Why it happens:** Codex loads project config only in trusted projects.
**How to avoid:** Ensure the project is trusted in Codex before relying on `.codex/` config layers.
**Warning signs:** Config-dependent behavior works in some repos but not others.

### Pitfall 3: AGENTS instructions truncated
**What goes wrong:** Codex loads only part of the repo guidance, causing missing constraints.
**Why it happens:** AGENTS instructions have a size cap (`project_doc_max_bytes`).
**How to avoid:** Keep AGENTS concise and use nested overrides or skills for detailed instructions.
**Warning signs:** Codex follows some guidance but ignores later bullets.

### Pitfall 4: Assuming custom slash commands exist
**What goes wrong:** Implementation plans rely on defining new slash commands, but Codex CLI only supports built-ins.
**Why it happens:** Confusing skill invocation with slash commands.
**How to avoid:** Use skills (`$skill`) or plain prompts; do not plan custom slash commands.
**Warning signs:** CLI UX depends on unimplemented commands.

## Code Examples

Verified patterns from official sources:

### Skill definition (repo-scoped)
```markdown
---
name: draft-commit-message
description: Draft a conventional commit message when asked
---

Draft a conventional commit message that matches the change summary.
```
Source: https://developers.openai.com/codex/skills/create-skill

### AGENTS discovery and layering
```bash
codex --ask-for-approval never "Summarize the current instructions."
```
Source: https://developers.openai.com/codex/guides/agents-md

### Project-scoped config
```toml
model = "gpt-5.2"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```
Source: https://developers.openai.com/codex/config-basic

### Non-interactive run for parity checks
```bash
codex exec --json "summarize the repo structure"
```
Source: https://developers.openai.com/codex/noninteractive

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Ad-hoc prompts for commands | Skills + AGENTS.md | Codex CLI skills system (current docs) | Enables repo-scoped, reusable command behaviors without user config changes. |

**Deprecated/outdated:**
- Custom slash commands: Codex CLI only supports built-in slash commands; use skills for custom workflows.

## Open Questions

1. **Does typing `/gsd:plan-phase` reliably auto-invoke the matching skill?**
   - What we know: Skills can be invoked explicitly with `$` or implicitly by matching descriptions.
   - What's unclear: Whether `/gsd:*` strings are strong enough triggers for implicit invocation across models.
   - Recommendation: Add explicit skill invocation guidance to AGENTS and/or ensure skill instructions are always loaded by mapping from the command text.

## Sources

### Primary (HIGH confidence)
- https://developers.openai.com/codex/cli/reference - Codex CLI commands and flags
- https://developers.openai.com/codex/config-basic - Config precedence and project config behavior
- https://developers.openai.com/codex/config-reference - Full config keys
- https://developers.openai.com/codex/guides/agents-md - AGENTS.md discovery and layering
- https://developers.openai.com/codex/skills - Skills overview and locations
- https://developers.openai.com/codex/skills/create-skill - Skill format and examples
- https://developers.openai.com/codex/rules - Rules file format and purpose
- https://developers.openai.com/codex/noninteractive - `codex exec` behavior
- https://github.com/openai/codex/releases/tag/rust-v0.92.0 - Current CLI release version

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - official Codex docs and release notes
- Architecture: MEDIUM - pattern inference + partial repo context
- Pitfalls: MEDIUM - derived from Codex docs + parity requirements

**Research date:** 2026-01-27
**Valid until:** 2026-02-26
