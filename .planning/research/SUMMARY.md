# Project Research Summary

**Project:** get-shit-done-cc Codex Support
**Domain:** Codex CLI integration for /gsd command packs via a Node installer
**Researched:** 2026-01-27
**Confidence:** MEDIUM

## Executive Summary

This project extends an existing Node-based /gsd installer to support Codex CLI using Codex-native surfaces (skills, `.codex/config.toml`, and `AGENTS.md`). Experts build this by keeping a single canonical command source and emitting runtime-specific outputs through adapter + transform layers, so parity with Claude/OpenCode stays intact. The recommended approach is to add a Codex runtime adapter, generate `SKILL.md` per /gsd command in `.codex/skills`, and layer repo-scoped `AGENTS.md` without touching user-level config.

The biggest risks are Codex config trust/precedence and non-interactive execution semantics. If `.codex/config.toml` is not trusted or `AGENTS.md` is mis-scoped, behavior will diverge silently. Mitigate with a small capability spike, explicit repo-trust guidance, and parity tests that verify instruction discovery, config loading, and `codex exec` behavior in a git worktree.

## Key Findings

### Recommended Stack

Codex CLI 0.92.0 is the target runtime with project-scoped config and skills as the supported extension points, while the installer remains Node-based. Prefer writing Codex assets directly (no TOML parsing) to avoid fragile config merges. Use Node's built-in test runner when Node >=20 is allowed; otherwise add a minimal test runner only if compatibility requires it.

**Core technologies:**
- `@openai/codex@0.92.0`: CLI runtime target — official support for skills, config, and `AGENTS.md`.
- `.codex/config.toml` schema 0.92.0: project-scoped config — avoids changing user-level settings.
- `.codex/skills/*/SKILL.md`: skill packaging — native extension mechanism.
- `AGENTS.md`: repo instruction surface — parity with existing instruction files.
- Node.js >=20: installer runtime + `node:test` — stable built-in runner for parity tests.

### Expected Features

The MVP must install repo-scoped Codex skills with explicit metadata and add `AGENTS.md` guidance without breaking existing Claude/OpenCode behavior. Differentiators like dual-scope install and richer skill assets can follow once parity is validated.

**Must have (table stakes):**
- Repo-scoped Codex skills for /gsd workflows — users expect skills as the extension mechanism.
- Skill metadata aligned to /gsd commands — required for reliable skill selection.
- Repository `AGENTS.md` guidance — Codex instruction discovery for consistent usage.

**Should have (competitive):**
- Dual-scope install (repo + user) — optional global skills for multi-repo teams.
- Skill assets + scripts — more deterministic workflows.

**Defer (v2+):**
- Custom slash command integration — only after Codex documents custom command storage.
- Codex Cloud task wrappers — outside current no-external-services constraint.

### Architecture Approach

Use a runtime adapter pattern with a content transformation pipeline: canonical `/gsd` content is converted into runtime-specific formats at install time, and config is written using native files for each runtime. This keeps Codex support additive and avoids content drift across CLIs.

**Major components:**
1. Installer core — runtime selection + orchestration.
2. Runtime adapters — per-runtime paths, install targets, config wiring.
3. Transformer pipeline — convert commands to `SKILL.md` and adjust paths.
4. Config writer — update `config.toml`/`AGENTS.md` safely.
5. Parity test harness — compare Codex outputs to Claude/OpenCode.

### Critical Pitfalls

1. **Project config not loading** — Codex only reads `.codex/config.toml` for trusted repos; document trust and avoid overwriting `~/.codex/config.toml`.
2. **Mis-scoped `AGENTS.md`** — install in repo root or configure fallback filenames; verify discovery in tests.
3. **Wrong CLI invocation (`codex` vs `codex exec`)** — standardize on `codex exec` with flags after subcommand for automation.
4. **Running outside a git repo** — `codex exec` enforces git; run parity tests inside a worktree.
5. **Auth mismatch in CI** — use `codex exec` + `CODEX_API_KEY`; avoid interactive login in headless runs.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Codex Capability Spike + Adapter Scaffolding
**Rationale:** Establish CLI semantics, config precedence, and install targets before writing features.
**Delivers:** Verified `codex exec` usage, trust/config behavior notes, Codex runtime adapter shell.
**Addresses:** Must-have skills placement + `AGENTS.md` discovery constraints.
**Avoids:** Config trust pitfalls, CLI flag placement errors, git repo requirement surprises.

### Phase 2: MVP Codex Installation (Skills + Instructions)
**Rationale:** Core product value is /gsd parity via Codex skills; implement minimal integration first.
**Delivers:** `.codex/skills/gsd-*/SKILL.md`, repo `AGENTS.md`, repo-scoped config template.
**Addresses:** Repo-scoped skills, skill metadata alignment, instruction layering.
**Avoids:** Mis-scoped instruction files and unintended user config edits.

### Phase 3: Parity Harness + UX Hardening
**Rationale:** Parity is the success metric; tests and safety checks prevent regressions.
**Delivers:** Parity tests using `node:test` (or fallback runner), CI auth preflight, installer status output.
**Uses:** Runtime adapter + transformer pipeline from earlier phases.
**Avoids:** Auth failures in CI, safety default overrides, config parsing surprises.

### Phase 4: Post-MVP Enhancements
**Rationale:** After parity is proven, add optional capabilities that increase adoption.
**Delivers:** Dual-scope install option, skill assets/scripts, onboarding hints.
**Addresses:** Differentiators without altering core behavior.

### Phase Ordering Rationale

- Capability spikes must precede install work because Codex trust/config and CLI semantics govern how assets load.
- The adapter + transformer pipeline keeps a single source of truth and reduces drift across CLIs.
- Parity tests follow installation so they can verify actual artifacts and catch pitfalls early.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Codex trust/config precedence and `codex exec` non-interactive semantics require validation in the target environment.
- **Phase 3:** CI auth flows and stdout/stderr parsing need empirical confirmation.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Skill generation + adapter structure is well-documented in Codex skills/docs.
- **Phase 4:** Optional enhancements follow established patterns once core is stable.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official Codex docs are solid, but Node version constraint conflicts with Node >=20 test runner guidance. |
| Features | MEDIUM | Clear Codex skills and AGENTS docs; custom slash commands remain undocumented. |
| Architecture | MEDIUM | Adapter + transform approach aligns with existing structure, but needs repo-specific validation. |
| Pitfalls | MEDIUM | Pitfalls map to official docs, but require hands-on verification in CI. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Node runtime constraint vs test runner:** Decide whether to raise Node to >=20 or add a fallback runner; affects parity test implementation.
- **Codex trust/config behavior in real repos:** Validate how `.codex/config.toml` loads in trusted vs untrusted repos.
- **CI auth strategy:** Confirm `CODEX_API_KEY` + `codex exec` path and preflight checks in target CI.

## Sources

### Primary (HIGH confidence)
- https://developers.openai.com/codex/cli — CLI overview and setup
- https://developers.openai.com/codex/config-basic — config locations, precedence, trust behavior
- https://developers.openai.com/codex/config-reference — config schema and overrides
- https://developers.openai.com/codex/guides/agents-md — instruction discovery and precedence
- https://developers.openai.com/codex/skills — skills format and locations
- https://developers.openai.com/codex/skills/create-skill — SKILL.md structure
- https://developers.openai.com/codex/noninteractive — `codex exec`, JSONL, auth and git repo requirement

### Secondary (MEDIUM confidence)
- https://github.com/openai/codex — CLI releases and install guidance
- https://nodejs.org/api/test.html — Node test runner stability in v20
- https://www.npmjs.com/package/tap — fallback test runner details

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes*
