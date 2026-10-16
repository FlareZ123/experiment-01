# Agent 16: simulator integrity and exact-card policy research

## Identity and lease

Normal research mode: actual uniform draw was 6/10. Lease committed at **2026-10-16T00:53:41.855984Z**, run `29fb5017-b15d-4b5b-b98a-719215ee324e`. Only self-release when real UTC clock >= **2026-10-16T02:03:41.855984Z**, after preserving research and deleting lease as the final push. Repo `FlareZ123/experiment-01` main, upstream Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`.

## Completed and verified

- `simulation/twinleaf/headless.cjs` gained opt-in `isolatePolicyRandomness:true`, distinct deterministic RNG streams for actual game and per-seat speculative bot decisions, with guaranteed restoration on thrown decode. Default remains legacy RNG for compatibility; serializable result includes protocol label. This prevents a bot's hypothetical action evaluations from consuming physical game random samples. It does not deliver common random outcomes after different legal action histories.
- `tests/twinleaf-policy-rng-isolation.test.cjs` has four pure Node tests; `simulation/twinleaf/smoke-test.cjs` now compares two full opt-in pinned-engine smoke summaries in addition to the legacy comparison.
- Manual workflow `.github/workflows/twinleaf-policy-rng.yml` passed all of the above on [run 38832858218](https://github.com/FlareZ123/experiment-01/actions/runs/38832858218). Findings in `results/twinleaf/seed-stream-isolation.md`, indexed in `results/README.md`.
- Unrelated full `twinleaf-smoke.yml` run [38832577805](https://github.com/FlareZ123/experiment-01/actions/runs/38832577805) halted on preexisting `tests/wobbuffet_donk_lock.test.cjs:53`: Exeggcute in discard was reported not blocked by the `IS_ABILITY_BLOCKED` probe under opposing Active Wobbuffet. It did not reach RNG tests. The more focused isolated RNG workflow passed.

## Current investigation

- `simulation/twinleaf/wobbuffet-discard-diagnostic.cjs` and manual workflow `.github/workflows/aichi-wobbuffet-discard.yml` characterize real `PowerEffect` and both default and actual-power `IS_ABILITY_BLOCKED` probes, in discard and hand, with enemy Wobbuffet Active vs Benched. Initial workflow dispatched; check its run and logs. Do not assume the existing test represents a genuine engine defect until observing direct real PowerEffect. Wobbuffet source is `ptcg-server/src/sets/07-x-and-y/set-phantom-forces/wobbuffet.ts`, Exeggcute `ptcg-server/src/sets/06-black-and-white/set-plasma-freeze/exeggcute.ts`, predicate `prefabs.ts`, `Store.propagateEffect` visits discard.
- If direct Ability is improperly allowed under Wobbuffet, diagnose and implement reversible narrow adapter hook or effective assertion. If only test stub is wrong, repair test with a mechanistically grounded probe.

## Research landscape and next priorities

- 29 exact published Aichi Top32 lists available, 3 missing ranks 23/25/28. Ranked field manifest in `results/aichi-2026/field.csv`. No representative match win rate, no 99.5% demonstration.
- Regidrago generic bot cannot value Double Dragon Energy (Agent20 `simulation/twinleaf/dde-attach-tactic.cjs`) or Marshadow removal of Temple (Agent20 `temple-unlock-tactic.cjs`); these are CI-backed policy failures. Compare/enforce credible opt-in corrected policy before field claims. Coordinate to avoid duplication.
- Source-copy gate and candidate reports exist: `candidate-hood-shadow-rider.md`, `candidate-temple-shadow-rider.md`; champion source baseline mirror ceiling conditional 98.4375% under symmetric policy. No tested competitive candidate.
- Information-set invariance of full-state bot decision remains unverified and may be another important bottleneck. Predeclare identical visible observations before comparing deck policies.
- Follow prompt's checkpoint procedure: inspect own mailbox and broadcasts, compare lease age using actual runtime, continue useful work while <70 minutes.
