# Phase 3: Parity Test Harness - Research

**Researched:** 2026-01-29
**Domain:** Parity test harness for Codex vs ClaudeCode /gsd artifacts
**Confidence:** MEDIUM

## Summary

This research focused on how to implement an automated parity test harness that mirrors the existing ClaudeCode parity suite exactly, using the same command coverage, fixtures/inputs, and execution ordering. The available internal sources (parity report and OpenCode parity plan artifacts) indicate a Node.js script that creates isolated workspaces, runs Codex and baseline CLIs in a strict order, compares `.planning` artifacts, normalizes time-based lines, and writes a Markdown report with pass/fail exit codes.

The standard approach in this repo is a dependency-free Node.js runner (stdlib only) driven by environment-provided command templates for Codex and baseline runs. The harness should avoid touching the primary repo state, rely on workspace copies, and report exactly which artifacts diverged to satisfy TEST-01.

**Primary recommendation:** Implement the parity harness as a single Node.js script using only stdlib, mirroring the ClaudeCode parity suite's commands, fixtures, ordering, and report format 1:1.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | >=16.7.0 | Run parity harness script | Repo engine constraint; enables stdlib-only scripting (`fs`, `path`, `os`, `child_process`, `crypto`). |
| Git CLI | Any | Copy tracked files into workspaces | `git ls-files` supports copying only tracked files, avoiding `.git` and untracked noise. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Codex CLI | User-managed | Produce Codex artifacts | Required for parity run; invoked via env-provided command template. |
| ClaudeCode/OpenCode CLI | User-managed | Baseline artifacts | Required for parity run; invoked via env-provided command template. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stdlib-only Node script | External test runner | Adds dependencies and diverges from ClaudeCode parity suite behavior. |

**Installation:**
```bash
# No new packages; use Node.js stdlib only
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/
└── parity-test.js   # Parity harness runner (ClaudeCode parity suite mirror)
.planning/
└── parity/          # Workspaces + parity-report.md (gitignored)
```

### Pattern 1: Isolated Workspace Parity Run
**What:** Copy the repo into two workspace directories (`codex-run` and `baseline-run`), run installers/commands inside each, then compare generated artifacts.
**When to use:** Any parity run to avoid mutating the primary repo or mixing artifacts.
**Example:**
```js
// Source: https://nodejs.org/api/child_process.html
const { spawnSync } = require('node:child_process');

const result = spawnSync('node', ['--version'], { encoding: 'utf8' });
if (result.status !== 0) {
  throw result.error || new Error(result.stderr);
}
```

### Pattern 2: Env-Driven Command Templates
**What:** Require env vars that define the Codex and baseline non-interactive commands; fail fast when missing.
**When to use:** Keep harness flexible without hardcoding CLI paths/flags.
**Example:**
```js
// Source: https://nodejs.org/api/child_process.html
const { execFileSync } = require('node:child_process');

execFileSync('node', ['--version'], { stdio: 'pipe' });
```

### Pattern 3: Artifact Diff With Normalization
**What:** Compare `.planning/phases/<phase>-*/` files, normalize time-based lines, and summarize mismatches in a report.
**When to use:** Artifact parity comparisons where timestamps/metrics would cause noise.
**Example:**
```js
// Source: https://nodejs.org/api/fs.html
const fs = require('node:fs');

const raw = fs.readFileSync('file.md', 'utf8');
const normalized = raw
  .split('\n')
  .filter((line) => !/^Last updated:/.test(line));
```

### Anti-Patterns to Avoid
- **Running in the primary repo:** Pollutes `.planning` and makes parity non-repeatable; always use isolated workspaces.
- **Changing fixtures/command ordering:** Breaks 1:1 parity with the ClaudeCode suite; use the same fixtures and order.
- **Diffing without normalization:** Time-based lines create false mismatches and make reports noisy.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fixture/command selection | New fixture set or altered ordering | ClaudeCode parity suite fixtures and order | Parity requires identical inputs and sequencing. |
| Workspace selection | Running in-place | `.planning/parity/{codex-run,baseline-run}` workspaces | Prevents main repo changes and cross-run contamination. |
| Diff normalization | Full raw diff | Strip time-based lines before comparison | Prevents false negatives from timestamps/metrics. |

**Key insight:** Parity accuracy depends on identical inputs, execution order, and normalized comparisons; even small deviations invalidate results.

## Common Pitfalls

### Pitfall 1: Missing or mismatched command templates
**What goes wrong:** Parity run fails or uses different CLI flags than ClaudeCode suite.
**Why it happens:** Env vars for Codex/baseline commands are missing or inconsistent.
**How to avoid:** Require env vars up front, print required names in `--help`, and fail fast with a clear message.
**Warning signs:** Parity run exits immediately, or logs show different CLI invocations per workspace.

### Pitfall 2: Phase collisions and missing SUMMARY artifacts
**What goes wrong:** Parity runs reuse an existing phase folder or fail to produce SUMMARY artifacts.
**Why it happens:** Phase ID already exists in a workspace, or execute-phase step skipped.
**How to avoid:** Use the ClaudeCode suite's fallback phase selection and always run both plan + execute commands.
**Warning signs:** Report notes missing `SUMMARY.md` or no execute artifacts to compare.

### Pitfall 3: Diff noise from timestamps/metrics
**What goes wrong:** Parity fails due to timestamp differences rather than real content mismatch.
**Why it happens:** Plan/summaries include time-based fields not normalized before diff.
**How to avoid:** Strip known time-based lines and trim trailing whitespace prior to comparison.
**Warning signs:** Diffs show only dates/durations while content otherwise matches.

### Pitfall 4: Workspace contamination
**What goes wrong:** Parity comparisons include artifacts from prior runs.
**Why it happens:** Workspaces are reused without cleanup or `.planning/parity` is not isolated.
**How to avoid:** Delete or recreate workspace directories unless `--keep-workspaces` is explicitly set.
**Warning signs:** Unexpected extra files or stale reports in `.planning/parity/`.

## Code Examples

Verified patterns from official sources:

### Spawn a CLI command and capture output
```js
// Source: https://nodejs.org/api/child_process.html
const { spawnSync } = require('node:child_process');

const result = spawnSync('node', ['--version'], { encoding: 'utf8' });
if (result.status !== 0) {
  throw result.error || new Error(result.stderr);
}
```

### Read and normalize file contents
```js
// Source: https://nodejs.org/api/fs.html
const fs = require('node:fs');

const contents = fs.readFileSync('file.md', 'utf8');
const lines = contents.split('\n');
const filtered = lines.filter((line) => !/^Last updated:/.test(line));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual parity runs and ad-hoc diffs | Automated parity harness with isolated workspaces and report | Phase 3 (current) | Repeatable, single-command parity verification with clear diffs. |

**Deprecated/outdated:**
- Manual parity checks only: limited repeatability and hard to identify specific artifact mismatches.

## Open Questions

1. **Where is the authoritative ClaudeCode parity suite definition?**
   - What we know: Phase 3 must mirror ClaudeCode suite 1:1 (commands, fixtures, ordering, edge runs).
   - What's unclear: The exact list of commands, fixtures/inputs, and report format currently used by ClaudeCode.
   - Recommendation: Locate the ClaudeCode parity harness implementation and copy its command list, fixtures, and report schema verbatim.

2. **Exact normalization rules used by ClaudeCode parity suite**
   - What we know: Timestamp and duration lines must be normalized to avoid false diffs.
   - What's unclear: The precise regex set used for normalization in ClaudeCode.
   - Recommendation: Extract normalization rules from ClaudeCode parity suite and apply the same list.

## Sources

### Primary (HIGH confidence)
- /Users/martistaerfeldt/dev/build/package.json - Node engine constraint (`>=16.7.0`)
- https://nodejs.org/api/child_process.html - CLI process execution APIs
- https://nodejs.org/api/fs.html - File system APIs

### Secondary (MEDIUM confidence)
- /Users/martistaerfeldt/dev/build/.planning/parity/opencode-run/.planning/phases/03-parity-test-harness/03-01-PLAN.md - ClaudeCode parity harness shape and flow
- /Users/martistaerfeldt/dev/build/.planning/parity/02-parity-report.md - Manual parity run findings and gaps
- /Users/martistaerfeldt/dev/build/.planning/research/PITFALLS.md - Parity-related integration pitfalls
- /Users/martistaerfeldt/dev/build/.planning/REQUIREMENTS.md - TEST-01 requirement

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Node version and stdlib reliance are explicit in repo metadata.
- Architecture: MEDIUM - Derived from ClaudeCode parity plan artifacts and parity report.
- Pitfalls: MEDIUM - Based on internal pitfall research and parity report notes.

**Research date:** 2026-01-29
**Valid until:** 2026-02-28
