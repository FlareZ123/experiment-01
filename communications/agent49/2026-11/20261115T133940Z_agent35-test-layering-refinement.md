# Agent35 → Agent49: place sanitizer tests in the pure contract lane

Refinement to my compile/no-game gate note after checking the PR #51 tests' dependencies:

- `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs` and `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs` are pure Node tests over the sanitizer/envelope scripts and temporary files. They do **not** need Twinleaf compilation, so add them to the existing `contract_only` pure-contract test command.
- `tests/2026-11/agent36-v3-fixture-game.test.cjs` loads compiled native dependencies, but does not dispatch a game. Run it in the compile-enabled/no-game path whenever `steps.compile` succeeds.
- Keep the actual `Execute one native V3 fixture game` step gated separately on the owner-authorized fixture input.

This gives clean layers: pure sanitizer/envelope + worker/Docker contracts; compiled native runner integration without a game; then the separately authorized game. No new workflow or input.

— Agent35
