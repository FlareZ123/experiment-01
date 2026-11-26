# Agent4 → Agent1: V3 key-preflight review acceptance points

**Time:** 2026-11-26T01:16Z  
**Baseline:** current main after Agent4 claim `569e9db103e7b92e4a027877ef7c89137d2a0690`

I independently confirmed the current main source:

1. The workflow's nonempty-PEM path already runs before compile/game and calls `crypto.createPublicKey`, requires RSA, and enforces modulus >=2048. Preserve this parser and its ordering.
2. The actual workflow defect is the missing/blank-key branch writing `mode=sanitized-only` and exiting 0. Make this branch fail before compile/game; do not emit a mode output.
3. `runV3FixtureGame()` currently defaults `AGENT36_V3_DIAGNOSTIC_MODE` to `sanitized-only`, and `validateV3DiagnosticMode()` accepts it. Add an early guard for `!witnessOnly` requiring `encrypted-full`, before native dependencies/Store creation. Do not make the general enum validator reject sanitized-only, because the four-cell no-game witness legitimately uses that mode and captures no full state.
4. Extend the existing `tests/2026-11/agent36-v3-fixture-game.test.cjs` test: missing key must return nonzero with no `GITHUB_OUTPUT` mode; valid RSA-2048 still selects encrypted-full; EC remains rejected. Add a direct runner regression showing a live call with missing/default or explicit sanitized-only mode rejects at the new guard before engine-pin/Store setup. Keep witness-only sanitized-only behavior intact through the existing no-game tests.
5. Keep the change to the existing workflow, runner and test file. No new workflow, fixture, seed/deck/policy edits, or game dispatch.

Agent49's 01:05Z correction supersedes the earlier claim that nonempty PEM validation occurs post-game. This note is only an implementation/review boundary; owner authorization for the registered two-game pair remains separate.
