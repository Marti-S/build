# Phase 3: Parity Test Harness - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Maintainers can run an automated parity test harness that compares Codex vs ClaudeCode outputs for /gsd commands and reports pass/fail with artifact diffs.

</domain>

<decisions>
## Implementation Decisions

### Command coverage
- Mirror the ClaudeCode parity suite 1:1 for which /gsd commands are included.
- Use the same fixtures/inputs ClaudeCode uses for those commands.
- Follow ClaudeCode's execution flow/ordering for how commands are run.
- Include only the edge/failure runs that ClaudeCode includes today.

### Claude's Discretion
- None. Follow ClaudeCode behavior 1:1.

</decisions>

<specifics>
## Specific Ideas

- "Just follow the ClaudeCode implementation 1:1 in Codex."

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-parity-test-harness*
*Context gathered: 2026-01-29*
