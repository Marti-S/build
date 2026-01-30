# Requirements: get-shit-done-cc Codex Support

**Defined:** 2026-01-27
**Core Value:** Codex CLI users can run any /gsd command end-to-end with the same artifacts and behavior as ClaudeCode.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Codex Integration

- [ ] **CODEX-01**: User can install /gsd into a repo so Codex CLI loads repo-scoped skills under `.codex/skills`
- [ ] **CODEX-02**: User can see each /gsd Codex skill named and described to match its Claude/OpenCode command
- [ ] **CODEX-03**: User gets repo-level `AGENTS.md` guidance for /gsd usage after install

### Parity

- [ ] **PARITY-01**: User can run any /gsd command in Codex CLI and produce the same `.planning` artifacts as ClaudeCode for the same inputs
- [ ] **PARITY-02**: Installing Codex support leaves Claude/OpenCode commands and installed assets unchanged

### Testing

- [ ] **TEST-01**: Maintainers can run automated parity tests that compare Codex vs ClaudeCode artifact outputs

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Installation Enhancements

- **ENH-01**: User can opt into dual-scope installs (repo + user) for Codex skills
- **ENH-02**: User can include skill assets/scripts for repeatable Codex workflows

### Onboarding

- **ONB-01**: Codex users see onboarding hints for `/skills`, `$skill` usage, and `AGENTS.md`

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Auto-editing `~/.codex/config.toml` | Avoid changing user-level Codex settings |
| Forcing permissive approval/sandbox modes | Respect Codex defaults and org policies |
| Custom slash command integration | Undocumented for Codex CLI today |
| Codex Cloud task wrappers / external services | Out of scope and violates constraints |
| New /gsd commands | Scope is parity only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CODEX-01 | Phase 1 | Complete |
| CODEX-02 | Phase 1 | Complete |
| CODEX-03 | Phase 1 | Complete |
| PARITY-01 | Phase 2 | Complete |
| PARITY-02 | Phase 2 | Complete |
| TEST-01 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-30 after phase 3 completion*
