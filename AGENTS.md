# AGENTS.md

This file provides repo-level guidance for Codex.
The block between the markers is managed by GSD and can be updated safely.



## Notes

- Add repo-specific guidance above or below the block if needed.
- Keep this file concise; Codex may apply size limits.

<!-- GSD:START -->
## GSD /gsd guidance (Codex)

- Use the /gsd commands for planning and execution in this repo.
- Follow each command's objective, workflow, and output constraints.
- Write artifacts under `.planning/` only.
- Keep installs repo-scoped; do not edit user-level Codex config.
- Treat the /gsd command name as the entrypoint you are executing.
- Map `/gsd:<command>` to `commands/gsd/<command>.md`, then read and follow it before acting.
- When you see `@~/.claude/get-shit-done/...`, resolve it to repo-local `@get-shit-done/...`.
- Keep outputs concise and structured for CLI consumption.
- Ask one targeted question only when blocked, with a recommended default.
- Do not invent command names or behaviors.
<!-- GSD:END -->
