# Phase 04: Parity Harness Alignment (Gap Closure) - Research

**Researched:** 2026-01-30
**Domain:** Parity harness wiring and execute-phase parity validation for Codex vs Claude/OpenCode
**Confidence:** MEDIUM

## Summary

This research focused on closing the v1.0 audit gaps for the parity harness: OpenCode baseline command invocation, maintainer documentation for phase overrides, and execute-phase parity handling when SUMMARY artifacts are missing. The audit and existing parity report show that the harness currently uses `/gsd:plan-phase` and `/gsd:execute-phase` for all baselines, which breaks OpenCode runs, and that execute-phase parity cannot be evaluated when SUMMARY files are absent.

The standard approach for this repo remains a stdlib-only Node.js parity runner with isolated workspaces, but it must be baseline-aware for command names, document `--phase` usage for non-roadmapped defaults, and explicitly validate SUMMARY generation after execute-phase. The harness should fail with a clear, actionable report when execute-phase artifacts are missing rather than silently producing an empty comparison.

**Primary recommendation:** Make the parity harness baseline-aware for OpenCode command names, document `--phase` override in maintainer docs, and add explicit SUMMARY presence checks with actionable failure reporting.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | >=16.7.0 | Run parity harness script | Repo engine constraint; enables stdlib-only script execution. |
| Git CLI | Any | Copy tracked files into workspaces | `git ls-files` avoids `.git` and untracked noise. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Codex CLI | User-managed | Generate Codex artifacts | Required for Codex parity runs. |
| Claude Code CLI | User-managed | Baseline artifacts (Claude) | Required when baseline is `claude`. |
| OpenCode CLI | User-managed | Baseline artifacts (OpenCode) | Required when baseline is `opencode`. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stdlib-only Node script | External test runner | Adds dependencies and diverges from existing parity harness architecture. |

**Installation:**
```bash
# No new packages; use Node.js stdlib only
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/
└── parity-test.js   # Parity harness runner
.planning/
└── parity/          # Workspaces + parity-report.md (gitignored)
```

### Pattern 1: Baseline-Aware Command Mapping
**What:** Switch plan/execute command names based on baseline runtime (`claude` uses `/gsd:plan-phase`, `opencode` uses `/gsd-plan-phase`).
**When to use:** Always when invoking baseline CLI commands in parity harness.
**Example:**
```js
// Source: /Users/martistaerfeldt/dev/build/.opencode/command/gsd-plan-phase.md
const baselinePlan = baseline === 'opencode'
  ? `/gsd-plan-phase ${phase} --skip-research --skip-verify`
  : `/gsd:plan-phase ${phase} --skip-research --skip-verify`;
```

### Pattern 2: Phase Override for Non-Roadmapped Defaults
**What:** Ensure maintainer docs and harness usage make `--phase` the override path when the default (`98`) is not in the roadmap.
**When to use:** Any parity run in repos where phase 98 does not exist.
**Example:**
```bash
# Source: /Users/martistaerfeldt/dev/build/MAINTAINERS.md
npm run test:parity -- --phase 4
```

### Pattern 3: Execute-Phase SUMMARY Validation
**What:** After execute-phase, check for `*-SUMMARY.md` in each workspace and fail with a clear message if missing.
**When to use:** Every parity run; missing SUMMARY means execute-phase parity is not evaluable.
**Example:**
```js
// Source: https://nodejs.org/api/fs.html
const fs = require('node:fs');

if (!fs.existsSync(summaryPath)) {
  throw new Error(`Missing SUMMARY: ${summaryPath}`);
}
```

### Anti-Patterns to Avoid
- **Hardcoding `/gsd:*` for OpenCode:** OpenCode commands use `/gsd-plan-phase` and `/gsd-execute-phase`, so slash-colon variants fail.
- **Assuming default phase exists:** Default `98` is not in the roadmap; always document and support `--phase` overrides.
- **Diffing without SUMMARY presence checks:** Missing execute outputs results in unclear parity status; fail fast with actionable messaging.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command naming | New custom command strings | Existing `/gsd:...` and `/gsd-...` command names | Baseline runtimes already define canonical names. |
| Execute-phase output | Custom summary generator | Execute-phase SUMMARY artifacts | Parity must reflect actual command outputs. |
| Phase selection | Hardcoded phase IDs | `--phase` override + fallback logic | Roadmaps vary; defaults can be missing. |

**Key insight:** Parity accuracy depends on invoking the correct command names and verifying real execute-phase outputs, not synthetic or assumed artifacts.

## Common Pitfalls

### Pitfall 1: OpenCode baseline command mismatch
**What goes wrong:** Parity run fails when baseline is OpenCode because `/gsd:plan-phase` is not recognized.
**Why it happens:** Harness uses slash-colon commands for all baselines.
**How to avoid:** Map baseline commands to `/gsd-plan-phase` and `/gsd-execute-phase` when baseline is `opencode`.
**Warning signs:** OpenCode logs show “unknown command” or failure before plan-phase completion.

### Pitfall 2: Default phase not in roadmap
**What goes wrong:** Plan-phase fails because phase 98 does not exist in roadmap.
**Why it happens:** Maintainers run parity with default `--phase` and do not override.
**How to avoid:** Document and require `--phase` override for non-roadmapped defaults.
**Warning signs:** Plan-phase logs complain about missing phase or roadmap lookup failures.

### Pitfall 3: Missing SUMMARY artifacts
**What goes wrong:** Execute-phase parity comparison is inconclusive with no SUMMARY files.
**Why it happens:** Execute-phase completes without producing summaries for the chosen phase.
**How to avoid:** Check for SUMMARY presence and report a clear failure with next steps.
**Warning signs:** Parity report shows “no execute-phase artifacts to compare.”

## Code Examples

Verified patterns from official sources:

### Run a command synchronously
```js
// Source: https://nodejs.org/api/child_process.html
const { spawnSync } = require('node:child_process');

const result = spawnSync('node', ['--version'], { encoding: 'utf8' });
if (result.status !== 0) {
  throw result.error || new Error(result.stderr);
}
```

### Read a file synchronously
```js
// Source: https://nodejs.org/api/fs.html
const fs = require('node:fs');

const contents = fs.readFileSync('file.md', 'utf8');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single command naming for all baselines | Baseline-aware command mapping | Phase 04 (planned) | Enables OpenCode parity runs without invocation errors. |
| Execute-phase comparison without SUMMARY validation | SUMMARY presence checks with actionable failures | Phase 04 (planned) | Prevents inconclusive parity reports. |

**Deprecated/outdated:**
- Using `/gsd:plan-phase` for OpenCode baselines: OpenCode requires `/gsd-plan-phase`.

## Open Questions

1. **Which phase should be the documented default for parity runs?**
   - What we know: Default `98` may not exist in the roadmap; current docs do not address overrides.
   - What's unclear: Whether the harness should change its default or only document overrides.
   - Recommendation: Keep current default but document `--phase` with a roadmap-backed example (e.g., phase 4).

2. **Why did execute-phase not produce SUMMARY in phase 3 parity runs?**
   - What we know: Both parity workspaces lacked `03-01-SUMMARY.md` after execute-phase.
   - What's unclear: Whether this is a phase-specific issue or a broader execute-phase behavior.
   - Recommendation: Add SUMMARY presence checks and re-run parity using a phase known to produce summaries.

## Sources

### Primary (HIGH confidence)
- /Users/martistaerfeldt/dev/build/package.json - Node engine constraint
- /Users/martistaerfeldt/dev/build/scripts/parity-test.js - Current parity harness implementation
- /Users/martistaerfeldt/dev/build/MAINTAINERS.md - Maintainer parity instructions
- /Users/martistaerfeldt/dev/build/.planning/v1.0-v1.0-MILESTONE-AUDIT.md - Audit gaps for parity harness alignment
- /Users/martistaerfeldt/dev/build/.planning/parity/02-parity-report.md - Execute-phase SUMMARY absence noted
- /Users/martistaerfeldt/dev/build/.opencode/command/gsd-plan-phase.md - OpenCode command naming
- https://nodejs.org/api/child_process.html - spawnSync behavior and options
- https://nodejs.org/api/fs.html - fs.readFileSync behavior

### Secondary (MEDIUM confidence)
- /Users/martistaerfeldt/dev/build/.planning/phases/02-codex-parity-execution/02-03-SUMMARY.md - Parity run history and missing summaries

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Node engine and harness architecture are explicit in repo files.
- Architecture: MEDIUM - Derived from current harness code and audit gap requirements.
- Pitfalls: MEDIUM - Based on audit and parity report evidence.

**Research date:** 2026-01-30
**Valid until:** 2026-02-28
