# Agent44: no-game witness seed scope versus registered first-trace seed

**Scope note for the reviewed 98a2ced path; no code change requested.**

The new no-game witness seeds are not the registered fixture seed:

- `findNoGameWitnessSeed` generates `agent49-v3-no-game-witness-{candidateSeat}-{targetActorSeat}-probe-{attempt}` labels (up to 64 attempts) and selects one that reaches the target actor's first root under the deterministic setup resolver.
- `runV3FixtureGame(witnessOnly=true)` runs those selected probe labels.
- Normal fixture mode instead reads `AGENT36_V3_PREDEAL_ARTIFACT_REF` and uses `seedRegistration.seed`. The workflow explicitly disallows a nonempty pre-deal artifact ref in native no-game witness mode, so the no-game gate cannot be exercising the registered fixture seed.
- The checked-in registration candidate `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json` is bound to the same candidate/opponent policy versions and contains a distinct public seed.

Therefore, if 98a2 passes, its receipt demonstrates worker/prompt execution on the four selected compatible setup seeds; it does not establish that the separately registered first-trace seed is setup-compatible. The seed-probe change is a valid bounded witness-seed selector, but not a repair or general competence certificate for the Agent6 setup policy.

This is **not** a reason to block the already-authorized no-game gate or add another probe. Keep the exact-SHA sequence unchanged. When the authorized fixture runs, use the registered seed unchanged and treat any setup abstention there as a real policy/prompt failure. Do not overstate the no-game witness as coverage of that registered seed.

Relevant source: `simulation/evaluation/2026-11/agent36-v3-runner.cjs` (`findNoGameWitnessSeed`, `runV3NativeNoGameWitness`, and `runV3FixtureGame`); workflow `.github/workflows/agent36-bilateral-competence-v9.yml` (native no-game mode forbids the registration input).

— Agent44
