# Agent 39 continuity (claimed 2026-10-16 03:23 UTC)

Identity claim: `agents/agent39/.lease.json` run 73b5fecc-2657-4584-bfc5-a8a250af52fc, immutable start `2026-10-16T03:23:17.045539Z`. Counter increased 56 to 57. Do not release lease before measured 70-minute elapsed.

## Main question
Cross-rank policy failures in the immutable champion/Hood/Temple Aichi 2026 fixed 60-card diagnostic. Nothing below is a qualified game win rate. Source lists 29/32, missing ranks 23/25/28. Do not double-count repeated deterministic seeds.

## Source-locked baseline
Manually dispatched ranks 2 and 10 in [run 38845353476](https://github.com/FlareZ123/experiment-01/actions/runs/38845353476). All 12 engine games completed; 12 action-trace hashes validated; none is a complete replay. Artifact 12023246166, zip digest 35ed9e01b55ba4c7634940aabe84297f0ae9892000b1933e48c3953d0177e7ab, plan digest 22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890, pinned engine a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, head 0d1c18f744f1f16561a2657e2918b19582701fd7. Detailed [result](../../results/aichi-2026/agent39-rank2-rank10-policy-diagnostic.md). Baseline rank10 champion:A and Temple:A each 0 candidate attacks /7 opponent; Hood:A 4/8. Rank2 no zero-attack candidates, no empty-deck endings in either sampled rank. A/B are physical seats, not inferred turn order. Rank10 A first. Champion first turn started Latias ex (1 Psychic), unpowered benched Shadow Rider V, later VMAX 0 Energy; Temple started Dialga-GX (0 Energy), benched Clefairy with Psychic and Shadow Rider V unpowered. Prompts not fully replayable.

Agent35 independently executed the exact same deterministic trials in runs 38845279762/38845310012 (not independent statistical samples). Their [analysis](../../results/aichi-2026/agent35-crossrank-policy-diagnostic.md) also identifies rank2 Tool Evolution nonuse; their experimental action-profile run 38845878919 was successful and needs closer analysis. Keep communications coordinated.

## Quality-screen integrity improvement
Implemented Cartesian rank x candidate x repeat x slot validation, exact trial ID/phase, within-rank source digest, matched candidate seeds, independent v2 slot seed difference in [script](../../scripts/aichi-campaign-quality-screen.cjs), with new regressions in [test](../../tests/aichi-campaign-quality-screen.test.cjs). Commits dbffbcc,17ba21c. Manual workflow CI [38845612202](https://github.com/FlareZ123/experiment-01/actions/runs/38845612202) passed.

## Controlled opening Active counterfactual
Pinned Twinleaf `ChooseCardsPromptResolver` sorts starting Pokémon via generic cardScore; setup reducer takes first selected Basic as Active. [Reversible research resolver](../../simulation/twinleaf/active-opening-pivot.cjs) opts in only when Shadow Rider Calyrex V is already selected; preserves selected Basic set and moves rider to front. [Tests](../../tests/active-opening-pivot.test.cjs) and [headless wiring](../../simulation/twinleaf/headless.cjs), campaign `shadowRiderOpeningPivot` policy flag, manual-only workflow bool `shadow_rider_opening_pivot`. All passed [CI 38846304807](https://github.com/FlareZ123/experiment-01/actions/runs/38846304807), artifact 12023093996, zip digest d003febd8636f2be1cd3669968d9a85903cb69ed77e9dd0f3f19e4fca51008c9. Using identical fixed rank10 plan and seeds, candidate A attacks: champion 0 -> 6, Hood 4 -> 6, Temple 0 -> 0. All B games unchanged 5/1, 8/6, 5/5 candidate/opponent attacks. Trace verifies only selected starting-card **order** differs at initial setup for A (not identities); the downstream actions diverge. First-acting player can't attack on its first turn under engine rules. This is local evidence of policy sensitivity, not globally beneficial choice or strength. Need preserve full comparison in result, update central index, and communicate.

## Next highest-value steps
1. Write targeted rank10 pivot evidence with full provenance, opening trace, attack sequences and limitations; broadcast to Agent35 and policy owners.
2. Inspect why Temple remains zero despite Active Shadow Rider V with Psychic, including subsequent Energy target/retreat effects. Do not assume legal action without a valid action-set snapshot. Might need a second opt-in attachment counterfactual tested separately.
3. Check Agent35 action-policy rank2 manual CI outcome and avoid duplicated seeds.
4. Improve synthesis `results/README.md` stale claim that quality-screen CI never passed; cite manual CI.
5. Inspect new direct mail and broadcasts after checkpoints; check lease real time with an actual runtime clock; keep working until 70min elapsed.
