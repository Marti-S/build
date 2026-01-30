# Pitfalls Research

**Domain:** Codex CLI integration for an existing CLI command pack
**Researched:** 2026-01-27
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Assuming Codex project config always loads

**What goes wrong:**
You install `.codex/config.toml` or project-specific settings but Codex ignores them, so behavior diverges from Claude/OpenCode parity.

**Why it happens:**
Codex only loads project-scoped `.codex/config.toml` when the project is trusted, and configuration precedence can override your settings.

**How to avoid:**
Detect trust state and document the need to trust the repo; use explicit `--config` overrides only when necessary; avoid overwriting user-level `~/.codex/config.toml` without consent.

**Warning signs:**
Settings like model, sandbox, or approval policy appear unchanged; Codex reports defaults even after install; config changes only take effect after `--profile` or `--config` overrides.

**Phase to address:**
Discovery & capability spike (config and trust behavior), Installer integration (write paths and precedence).

---

### Pitfall 2: Missing or mis-scoped AGENTS.md instructions

**What goes wrong:**
Codex runs without the GSD instructions because files are placed under Claude/OpenCode conventions or in the wrong directory scope, leading to behavior drift.

**Why it happens:**
Codex discovers `AGENTS.md` and `AGENTS.override.md` in a specific root-to-cwd order and uses fallbacks only if configured.

**How to avoid:**
Install `AGENTS.md` in the repo root (and any needed overrides) or configure `project_doc_fallback_filenames` in Codex config to include existing instruction filenames; verify with a short Codex prompt that lists active instruction sources.

**Warning signs:**
Codex does not echo expected guidance when asked; instructions differ based on working directory; overrides unexpectedly shadow base guidance.

**Phase to address:**
Installer integration (instruction file placement), Parity test phase (instruction discovery tests).

---

### Pitfall 3: Incorrect CLI invocation for automation

**What goes wrong:**
Automation uses `codex` (TUI) or passes global flags in the wrong position, leading to ignored flags, hanging sessions, or non-parity behavior.

**Why it happens:**
Global flags are meant to be placed after subcommands (for example `codex exec --model ...`), and `codex exec` is the supported non-interactive mode.

**How to avoid:**
Standardize on `codex exec` for non-interactive flows; ensure flags are placed after subcommands; parse outputs with the documented stdout/stderr separation or JSONL mode.

**Warning signs:**
Flags appear to have no effect; automation hangs in a TUI; outputs mix progress and final answers unexpectedly.

**Phase to address:**
Capability spike (CLI semantics), Parity test phase (automation harness).

---

### Pitfall 4: Running non-interactive tasks outside a Git repo

**What goes wrong:**
`codex exec` fails because it requires a Git repository, breaking parity tests or install-time validation.

**Why it happens:**
Codex enforces a Git repo check by default for safety; installers often run from arbitrary directories.

**How to avoid:**
Ensure parity tests and Codex runs execute within a git worktree; only use `--skip-git-repo-check` in explicitly isolated environments.

**Warning signs:**
`codex exec` exits early with a git repo error; the installer works on some machines but fails in clean CI.

**Phase to address:**
Capability spike (execution constraints), Parity test phase (runner setup).

---

### Pitfall 5: Authentication flow mismatches (interactive vs exec)

**What goes wrong:**
Automation assumes `CODEX_API_KEY` works for interactive `codex` or CLI login, causing prompts or failures in CI.

**Why it happens:**
`CODEX_API_KEY` is only supported in `codex exec`; interactive sessions require a login flow (OAuth, device auth, or stdin API key).

**How to avoid:**
Use `codex exec` with `CODEX_API_KEY` for CI; use `codex login --with-api-key` or OAuth for interactive flows; add a preflight `codex login status` check.

**Warning signs:**
CLI opens a browser in CI; sessions prompt for authentication unexpectedly; tests fail only in headless environments.

**Phase to address:**
Capability spike (auth modes), Parity test phase (CI auth).

---

### Pitfall 6: Forcing model or safety settings that Codex should manage

**What goes wrong:**
Integration overrides `--model`, `--sandbox`, or `--yolo`, changing behavior relative to Codex defaults and breaking parity with existing Claude/OpenCode behavior.

**Why it happens:**
Developers try to standardize behavior across CLIs without accounting for Codex’s built-in model selection and safety defaults.

**How to avoid:**
Respect Codex defaults unless a documented parity requirement exists; only set sandbox/approval modes when explicitly needed for automation and in a safe environment.

**Warning signs:**
Unexpected command execution without approvals; different output verbosity or reasoning compared to baseline; users report more invasive changes.

**Phase to address:**
Parity definition phase (decide what “parity” means), Release hardening (safety defaults).

---

### Pitfall 7: Ignoring config precedence and JSON parsing of `--config`

**What goes wrong:**
You pass `--config` overrides that parse as JSON unexpectedly or you override values that are later superseded by profiles or project config, causing subtle mismatches.

**Why it happens:**
Codex parses `--config` values as JSON when possible and applies strict precedence rules.

**How to avoid:**
Use explicit quoting for string values; document which layer is authoritative; keep `--config` usage to testing and automation only.

**Warning signs:**
Unexpected types in config (booleans/numbers instead of strings); settings differ between local dev and CI; changes only apply with `--profile`.

**Phase to address:**
Capability spike (config semantics), Parity test phase (config matrix).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hard-code `codex` binary path | Quick installation checks | Breaks on Homebrew vs npm installs and OS differences | Never; discover via PATH or explicit user config |
| Assume `~/.codex` always exists | Fewer setup steps | Fails on fresh machines or CI | Only in internal dev environments with bootstrap |
| Force `--full-auto` for parity tests | Fast runs | Masks approval and sandbox parity issues | Only in isolated CI with explicit risk acceptance |
| Skip `codex exec --json` parsing | Simpler logs | Fragile parsing when output format changes | Only for manual runs |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Codex config | Write `.codex/config.toml` and assume it loads | Ensure project is trusted; respect config precedence and profile behavior |
| Codex CLI | Use global flags before subcommand | Place flags after the subcommand (e.g., `codex exec --model ...`) |
| Codex exec output | Parse stdout as full log | Progress goes to stderr; use JSONL with `--json` when scripting |
| Auth in CI | Use `CODEX_API_KEY` with interactive `codex` | Use `codex exec` for CI or `codex login --with-api-key` for TUI |
| Instruction files | Keep Claude/OpenCode instruction filenames | Add `AGENTS.md` or configure `project_doc_fallback_filenames` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Running TUI in CI | Jobs hang or time out | Use `codex exec` and JSONL output | Any non-interactive runner |
| Unbounded JSONL logs | CI log size grows rapidly | Filter or store only final output with `-o` | At scale or long tasks |
| Repeated config writes | Installer slows down on large repos | Make install idempotent and skip when unchanged | Large mono-repos |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using `--yolo` or `danger-full-access` by default | Unbounded command execution | Default to Codex safety settings; only allow elevated modes in isolated CI |
| Writing credentials into config files | Token leakage on disk or in git | Use `codex login` or env vars; never write API keys to repo files |
| Trusting projects automatically | Running unreviewed configs | Require explicit trust decision before enabling project configs |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Silent fallback to non-Codex behavior | Users think Codex support is broken | Provide clear CLI status and detection output |
| Incomplete installation messaging | Users miss required Codex install/login | Add preflight checks and actionable remediation steps |
| Mixed parity expectations | Users see different results across CLIs | Document behavior differences and parity test coverage |

## "Looks Done But Isn't" Checklist

- [ ] **Codex support:** `codex` is installed and on PATH — verify `codex --version`
- [ ] **Auth:** CI has `CODEX_API_KEY` or an explicit login path — verify `codex login status`
- [ ] **Instructions:** Codex loads GSD instructions — verify `codex --ask-for-approval never "Summarize instructions"`
- [ ] **Config scope:** `.codex/config.toml` is loaded — verify trust status and precedence
- [ ] **Automation mode:** CI uses `codex exec` — verify stdout/stderr handling or JSONL parsing

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Mis-scoped config | MEDIUM | Detect trust issue, move config to `~/.codex` or add explicit `--config` overrides, re-run parity tests |
| Missing instructions | LOW | Add `AGENTS.md` or update `project_doc_fallback_filenames`, re-run a short verification prompt |
| Auth failure in CI | MEDIUM | Switch to `codex exec` with `CODEX_API_KEY`, add login status precheck |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Config trust/precedence | Capability spike + Installer integration | Test trusted vs untrusted repo behavior |
| AGENTS.md discovery | Installer integration | `codex --ask-for-approval never "Summarize instructions"` |
| CLI flag placement | Capability spike | CLI contract tests with subcommands |
| Git repo requirement | Capability spike | Run `codex exec` in/out of git repo in CI |
| Auth mode mismatch | Parity test phase | `codex login status` + `codex exec` in CI |
| Safety override misuse | Parity definition + Release hardening | Regression tests for default safety settings |
| `--config` parsing surprises | Capability spike + Parity tests | Matrix tests for config precedence and JSON parsing |

## Sources

- https://developers.openai.com/codex/cli/reference (CLI flags, subcommands, flag placement guidance)
- https://developers.openai.com/codex/config-basic (config locations, precedence, trust behavior)
- https://developers.openai.com/codex/config-reference (config keys and overrides)
- https://developers.openai.com/codex/noninteractive (codex exec behavior, stdout/stderr, git repo requirement, CODEX_API_KEY scope)
- https://developers.openai.com/codex/guides/agents-md (AGENTS.md discovery and precedence)
- https://github.com/openai/codex (Codex CLI installation and releases)

---
*Pitfalls research for: Codex CLI integration for an existing CLI command pack*
*Researched: 2026-01-27*
