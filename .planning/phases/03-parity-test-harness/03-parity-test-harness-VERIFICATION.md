---
phase: 03-parity-test-harness
verified: 2026-01-29T00:00:00Z
status: human_needed
score: 3/3 must-haves verified
human_verification:
  - test: "Run parity harness with real CLIs"
    expected: "`npm run test:parity` generates `.planning/parity/parity-report.md`, logs under `.planning/parity/`, and exits 0 on parity or 1 on diffs"
    why_human: "Requires installed/authenticated Codex and Claude/OpenCode CLIs; cannot be verified statically"
  - test: "Verify isolated workspace behavior"
    expected: "Primary repo files remain unchanged; only `.planning/parity/` is created/modified"
    why_human: "Side effects of real CLI runs depend on environment and cannot be validated by static code inspection"
---

# Phase 3: Parity Test Harness Verification Report

**Phase Goal:** Maintainers can automatically verify Codex vs ClaudeCode artifact parity
**Verified:** 2026-01-29T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Maintainer can run a single command to compare Codex vs ClaudeCode artifacts and see pass/fail status | ✓ VERIFIED | `package.json` defines `test:parity` -> `node scripts/parity-test.js`; report includes PASS/FAIL and exit codes in `scripts/parity-test.js` |
| 2 | Parity report lists which .planning artifacts differ and where logs live | ✓ VERIFIED | `scripts/parity-test.js` writes report with log paths, missing/extra files, and diff summary |
| 3 | Parity runs execute in isolated workspaces without modifying primary repo artifacts | ✓ VERIFIED | `scripts/parity-test.js` copies tracked files into `.planning/parity/codex-run` and `.planning/parity/baseline-run` and runs there |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `scripts/parity-test.js` | Parity harness provisioning workspaces, running CLIs, diffing artifacts | ✓ VERIFIED | Substantive implementation; handles workspaces, installs, command runs, and report output |
| `package.json` | npm script entrypoint for parity test | ✓ VERIFIED | `test:parity` script points to `scripts/parity-test.js` |
| `MAINTAINERS.md` | Maintainer instructions for running parity tests | ✓ VERIFIED | Includes prerequisites, env vars, command usage, outputs, exit codes |
| `.gitignore` | Ignore parity workspaces and reports | ✓ VERIFIED | Includes `.planning/parity/` |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `package.json` | `scripts/parity-test.js` | `test:parity` script | ✓ VERIFIED | `test:parity` script runs `node scripts/parity-test.js` |
| `scripts/parity-test.js` | `.planning/parity` | report/log/workspace output | ✓ VERIFIED | Defaults to `.planning/parity/parity-report.md` and writes logs/workspaces under `.planning/parity/` |
| `scripts/parity-test.js` | `bin/install.js` | workspace installs | ✓ VERIFIED | Runs `node bin/install.js --codex --local` and baseline install |
| `scripts/parity-test.js` | `.planning/phases/<phase>-*` | artifact diff | ✓ VERIFIED | Uses `.planning/phases` directories via `findPhaseDirs` for diffing |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| --- | --- | --- |
| TEST-01: Maintainers can run automated parity tests that compare Codex vs ClaudeCode artifact outputs | ? NEEDS HUMAN | Requires real CLI execution to confirm end-to-end behavior |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None | - | - | - | - |

### Human Verification Required

### 1. Run parity harness with real CLIs

**Test:** Run `npm run test:parity` with `GSD_PARITY_CODEX_CMD` and `GSD_PARITY_BASELINE_CMD` set
**Expected:** Report at `.planning/parity/parity-report.md`, logs under `.planning/parity/`, exit code `0` on parity or `1` on diffs
**Why human:** Requires installed/authenticated Codex and Claude/OpenCode CLIs

### 2. Verify isolated workspace behavior

**Test:** After a parity run, confirm only `.planning/parity/` is created/modified
**Expected:** Primary repo files remain unchanged; only parity workspace/report/logs are added
**Why human:** Real CLI runs may create additional artifacts in environment-specific ways

### Gaps Summary

No structural gaps found. End-to-end behavior requires human verification with real CLIs.

---

_Verified: 2026-01-29T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
