# Feature Research

**Domain:** Codex CLI extension mechanism for /gsd command packs
**Researched:** 2026-01-27
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Repo-scoped Codex skills for /gsd workflows | Codex CLI uses skills as the primary extension mechanism for reusable workflows | MEDIUM | Implement `SKILL.md`-based skills under `.codex/skills` so Codex can load them at repo scope (explicit `$skill`/`/skills` and implicit invocation). Source: Codex skills docs. |
| Skill metadata aligned to /gsd commands | Codex selects skills by name/description; poor naming makes the pack unusable | LOW | Define `name` and `description` in each `SKILL.md` to map cleanly to `/gsd` workflows and make implicit invocation reliable. |
| Repository instructions via `AGENTS.md` | Codex reads `AGENTS.md` for persistent project guidance | LOW | Include a repo-level `AGENTS.md` (or optional `.override`) describing `/gsd` usage patterns and guardrails. Source: AGENTS.md discovery guide. |
| No breaking changes to existing Claude/OpenCode behavior | Users expect parity across CLIs; Codex support should be additive | LOW | Installer must keep Claude/OpenCode assets unchanged and add Codex assets alongside them. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dual-scope install (repo + user) | Lets teams ship repo-local skills while power users opt into global skills | MEDIUM | Provide an opt-in install path to `$CODEX_HOME/skills` in addition to repo `.codex/skills`. Skills precedence is documented in Codex skills guide. |
| Skill assets + scripts for repeatable workflows | Moves `/gsd` from “prompt packs” to deterministic workflows | MEDIUM | Add optional `scripts/` and `references/` folders inside skills for richer guidance and repeatability. |
| Codex-friendly onboarding hints | Reduces friction for first-time Codex users | LOW | Provide README snippets that point to `/skills`, `$skill` invocation, and `/init` for `AGENTS.md` scaffolding. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-editing `~/.codex/config.toml` | “Make it work automatically” | Violates user config boundaries and can change approvals/sandbox settings | Keep Codex assets repo-local; document optional config changes instead. |
| Forcing permissive approval or sandbox modes | “Speed up workflows” | Unsafe; contradicts Codex defaults and org policies | Respect Codex defaults; let users choose `--full-auto` or config. |
| Relying on undocumented custom slash commands | “Slash commands feel native” | Custom command storage and discovery aren’t documented in fetched sources | Use skills (`SKILL.md`) and `AGENTS.md` until custom commands are officially documented for CLI. |
| Requiring Codex Cloud or remote MCP servers | “More powerful workflows” | Violates “no external services” constraint and adds auth overhead | Keep workflows local; allow optional MCP only if explicitly configured by user. |

## Feature Dependencies

```
[Repo-scoped Codex skills]
    └──requires──> [Skill metadata aligned to /gsd commands]
                       └──requires──> [AGENTS.md guidance for consistent usage]

[Skill assets + scripts] ──enhances──> [Repo-scoped Codex skills]

[Repo-local config overrides] ──conflicts──> [No behavior changes to user defaults]
```

### Dependency Notes

- **Repo-scoped Codex skills requires skill metadata aligned to /gsd commands:** Codex skill selection depends on `name`/`description` in `SKILL.md`.
- **Skill assets + scripts enhances repo-scoped skills:** Supplementary assets make workflows more deterministic and reusable.
- **Repo-local config overrides conflicts with no behavior changes:** Project-scoped config is only loaded for trusted projects; avoid forced overrides to keep parity.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Repo-scoped Codex skills for /gsd workflows — core extension mechanism in Codex CLI.
- [ ] Skill metadata aligned to /gsd commands — ensures explicit and implicit invocation works.
- [ ] Repository `AGENTS.md` guidance — aligns Codex behavior with existing /gsd usage patterns.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Dual-scope install (repo + user) — add optional global skill installs for multi-repo teams.
- [ ] Skill assets + scripts for repeatable workflows — improve determinism once base usage is validated.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Custom slash command integration — only if Codex CLI documents extension storage/format.
- [ ] Codex Cloud task wrappers — outside “no external services” constraint today.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Repo-scoped Codex skills for /gsd workflows | HIGH | MEDIUM | P1 |
| Skill metadata aligned to /gsd commands | HIGH | LOW | P1 |
| Repository `AGENTS.md` guidance | HIGH | LOW | P1 |
| Dual-scope install (repo + user) | MEDIUM | MEDIUM | P2 |
| Skill assets + scripts for repeatable workflows | MEDIUM | MEDIUM | P2 |
| Custom slash command integration | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Skills-based workflows | Codex built-in SYSTEM skills | OpenAI community skills repo (`openai/skills`) | Ship `/gsd` as repo-scoped skills with explicit metadata. |
| Persistent repo guidance | Codex `AGENTS.md` instructions | Claude/OpenCode command packs (existing) | Add `AGENTS.md` guidance that mirrors current `/gsd` workflows. |

## Sources

- https://developers.openai.com/codex/cli
- https://developers.openai.com/codex/cli/features
- https://developers.openai.com/codex/cli/reference
- https://developers.openai.com/codex/cli/slash-commands
- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/skills
- https://developers.openai.com/codex/config-reference
- https://github.com/openai/codex

---
*Feature research for: Codex CLI /gsd command pack integration*
*Researched: 2026-01-27*
