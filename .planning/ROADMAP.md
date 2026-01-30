# Roadmap: get-shit-done-cc Codex Support

## Overview

This roadmap delivers Codex CLI support for /gsd by first installing repo-scoped skills and guidance, then ensuring end-to-end parity with ClaudeCode behavior, and finally locking parity with automated tests for maintainers. Each phase produces a user-verifiable capability and preserves existing Claude/OpenCode behavior.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Codex Repo Integration** - Users can install repo-scoped Codex skills and guidance for /gsd
- [x] **Phase 2: Codex Parity Execution** - Users can run any /gsd command in Codex with parity and no regressions
- [x] **Phase 3: Parity Test Harness** - Maintainers can verify Codex vs ClaudeCode parity automatically
- [ ] **Phase 4: Parity Harness Alignment (Gap Closure)** - Close audit gaps in parity harness wiring and docs

## Phase Details

### Phase 1: Codex Repo Integration
**Goal**: Users can install repo-scoped Codex skills and guidance for /gsd in a repo
**Depends on**: Nothing (first phase)
**Requirements**: CODEX-01, CODEX-02, CODEX-03
**Success Criteria** (what must be TRUE):
  1. User can run the installer and find /gsd skills under `.codex/skills` in the repo
  2. User can see each /gsd Codex skill name and description match its Claude/OpenCode command
  3. User can read repo-level `AGENTS.md` guidance for /gsd usage after install
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Add Codex repo install for skills + AGENTS.md
- [x] 01-02-PLAN.md — Add Codex uninstall support and README guidance

### Phase 2: Codex Parity Execution
**Goal**: Users can run any /gsd command in Codex CLI with parity while existing Claude/OpenCode installs remain unchanged
**Depends on**: Phase 1
**Requirements**: PARITY-01, PARITY-02
**Success Criteria** (what must be TRUE):
  1. User can run any /gsd command in Codex CLI and produce the same `.planning` artifacts as ClaudeCode for the same inputs
  2. User can install Codex support without altering existing Claude/OpenCode commands or installed assets
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Ensure Codex loads command files and maps repo paths
- [x] 02-02-PLAN.md — Add baseline Claude/OpenCode AGENTS templates
- [x] 02-03-PLAN.md — Run Codex vs OpenCode parity and report results

### Phase 3: Parity Test Harness
**Goal**: Maintainers can automatically verify Codex vs ClaudeCode artifact parity
**Depends on**: Phase 2
**Requirements**: TEST-01
**Success Criteria** (what must be TRUE):
  1. Maintainer can run a single test command to compare Codex and ClaudeCode outputs and see pass/fail results
  2. Maintainer can inspect a test failure and identify which artifacts diverged
**Plans**: 1 plan

Plans:
- [x] 03-01-PLAN.md — Add parity test harness runner

### Phase 4: Parity Harness Alignment (Gap Closure)
**Goal**: Close v1.0 audit gaps in parity harness wiring, docs, and execute-phase parity handling
**Depends on**: Phase 3
**Requirements**: TEST-01
**Gap Closure**: v1.0 milestone audit
**Success Criteria** (what must be TRUE):
  1. Parity harness supports OpenCode baseline command invocation and completes without command mismatch
  2. Maintainer docs include phase override guidance for non-roadmapped defaults
  3. Execute-phase parity comparison either produces SUMMARY artifacts or reports a clear, actionable failure
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Baseline-aware parity harness and SUMMARY validation
- [ ] 04-02-PLAN.md — Update parity maintainer docs with phase override guidance

## Progress

**Execution Order:**
Phases execute in numeric order: 2 → 2.1 → 2.2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Codex Repo Integration | 2/2 | Complete | 2026-01-27 |
| 2. Codex Parity Execution | 3/3 | Complete | 2026-01-28 |
| 3. Parity Test Harness | 1/1 | Complete | 2026-01-30 |
| 4. Parity Harness Alignment (Gap Closure) | 1/2 | In progress | - |
