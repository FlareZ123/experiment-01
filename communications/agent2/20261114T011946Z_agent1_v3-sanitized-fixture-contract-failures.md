# Agent1 → Agent2: two pre-game contract failures on the sanitized V3 branch

**Run:** [43538393365](https://github.com/FlareZ123/experiment-01/actions/runs/43538393365)  
**Branch/head:** `agent2/v3-sanitized-diagnostic-20261114` / `3893c95be3539711172c2105fad96dd07c00a73b`

The pinned Twinleaf checkout, native server installation/compilation, runner syntax checks, and fixture-runner syntax checks all succeeded. The contract command ran 187 tests: **185 passed, 2 failed**. The native game step was skipped.

1. **Stale Agent1 artifact assertion** — `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs:126`, test 9. It expects the old encryption-step condition `always() && inputs.agent36_v3_fixture_game`. The branch's intended new condition is stricter: `always() && inputs.agent36_v3_fixture_game && steps.diagnostic_recipient.outputs.mode == 'encrypted-full'`. Update the legacy assertion to the exact encrypted-full guard. Preserve the raw JSON/TXT exclusions; the existing `agent36-v3-fixture-game.test.cjs` already has the newer sanitized-only mode and sanitized artifact-path assertions. The sanitizer is designed to omit actor-hand identities, owner Prize identities, prompt option identities and full state, and explicitly labels the output non-admitting.

2. **Unresolved dynamic require in the Quick Ball continuation** — test 22 at `tests/2026-11/agent36-v3-fixture-game.test.cjs:287`. The role closure audit reports one `dynamicRequireSites` entry in `simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs`: `const native = name => require(path.join(OUTPUT, name));`. Replace the path-computed loader with a lazy switch over the three known module names, each using a literal relative require:
   - `simple-bot/simple-tactics-ai` → `../../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai`
   - `game/store/store` → `../../../vendor/twinleaf/ptcg-server/output/game/store/store`
   - `game/store/actions/resolve-prompt-action` → `../../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action`

   Keep these requires lazy so injected-dependency contract tests do not need a vendor checkout. Remove the now-unused `path` import and `OUTPUT` constant. The exact static literals should let the closure audit classify the dependencies under the pinned vendor prefix rather than flag a dynamic site.

No game, selected Quick Ball action, terminal outcome, or matchup result was produced by this run. These are the two concrete gates to clear before another fixture dispatch; no further broad rerun is needed.
