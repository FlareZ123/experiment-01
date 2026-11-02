# Agent 5: genuine original-120 card custody audit on the exact Aichi rank-9 source deals

**2 November 2026 | compiled native comparison | successful manual CI run 41522501814 | four matched historical source games | zero competitively qualified games**

## Question

The canonical bilateral development policy already enables `capturePhysicalZoneIntegrity` and a strict settled-root 60/60 physical count check, but generally does not request `captureOriginalOwnerIntegrity`. Could the same actual games pass the stronger **identity-specific 120-original-card ownership** audit, without changing any chosen action or source physical deal?

This matters because a purely count-based audit cannot rule out physical cards crossing between players or cloned cards replacing originals while two board totals remain 60. Direct pure execution of [the existing identity ledger](../../simulation/twinleaf/physical-card-ledger.cjs) with two original 60-card sets, then swapping one physical card from each player, preserved both 60-card totals and produced **two displaced-original-reference violations**. A copied card with identical printing is also detectable by reference identity (one original missing and one unregistered).

## Preregistered exact historical comparison

The [registered audit protocol](registrations/agent5-rank9-original120-custody-samedeal-20261102.json) specifies the four existing source rank-9 games and expected outcome fields. This is a postselected developmental cohort already explored by Agent 10, so no independent strength testing is claimed.

- Source: original Shun Ito Aichi final rank 9 **Absol Electrode**, unchanged authentic 60 in `full-decklists.json`.
- Candidate printed 60s: unchanged `champion-reference` and `new-moon-lockbreaker-v1`.
- Original physical slots/seeds: candidate A 3060075246, candidate B 690229661, both candidates each.
- Parent policy: [Agent 10 original rank9 known-dead Claw](../../simulation/evaluation/agent10-rank9-known-dead-attack-counterfactual.cjs), which already requests physical zone conservation and original printed-source equality.
- Intervention: [new reversible audit adapter](../../simulation/evaluation/agent5-rank9-original120-custody-pair.cjs) adds **only** `captureOriginalOwnerIntegrity:true` to `headless.runMatch` at the original actual Store execution boundary. It changes no decision policy, printed 60, seed, physical slot, attached Energy, or source root. It restores the module export in `finally`.
- [Four pure adapter tests](../../tests/agent5-rank9-original120-custody-pair.test.cjs) check preexisting physical gate, no mutation, error propagation/restoration, and multitrial accounting. Additional [adversarial original-owner tests](../../tests/agent5-original-owner-custody-adversarial.test.cjs) cover count-balanced cross-owner swaps and same-print clone substitutions (these latter tests were committed **after** the pinned native CI run and are a separate regression addition).

## Authentic compiled Store results

[Manual CI #41522501814](https://github.com/FlareZ123/experiment-01/actions/runs/41522501814), checked-out Git commit `1a8b4e013da3afd2b4069662158b867f26a387d1`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Native JSON artifact #13178791106](https://github.com/FlareZ123/experiment-01/actions/runs/41522501814/artifacts/13178791106), ZIP SHA-256 `088c29bc67bc3735b4d8b1aee8c6c1693c9c473ed3457eea213161fa80d70332`, artifact name `agent5-rank9-original120-custody-native`.

| Registered same-deal trial ID | Control native | Stronger-owner native | Full physical deal matched | Entire native root trace matched | Original owner reference custody |
| --- | --- | --- | --- | --- | --- |
| 9:0:A:champion-reference | Engine terminal | Engine terminal | Yes | Yes | Passed |
| 9:0:A:new-moon-lockbreaker-v1 | Engine terminal | Engine terminal | Yes | Yes | Passed |
| 9:0:B:champion-reference | Engine terminal | Engine terminal | Yes | Yes | Passed |
| 9:0:B:new-moon-lockbreaker-v1 | Action cap | Action cap | Yes | Yes | Passed |

The compiled reporter logged `observedControlAttempts=4`, `observedOriginal120Attempts=4`, `allIdentityAndPhysicalDealsMatch=true`, `allNativeRootsIdentical=true`, and `original120CertifiedGames=4`. The last counter is **original physical-owner custody only**; all four `physicalZoneQualification` outcomes were `SETTLED_PHYSICAL_INTEGRITY_PASSED` with `originalOwnerIntegrityQualified:true`. Native dispositions were three engine terminals and one action cap in **each arm**.

No control/treatment root difference was observed, so enabling this stronger read-only audit did not change these four gameplay trajectories. This is a useful audit integration check, rather than a discovered gameplay advantage.

## Interpretation and next verification

**Proven in this limited historical cohort:** the native engine retained all 120 original physical card references with the correct owner over completed root chains, and enabling this additional check was observationally inert. Thus there is no observed cross-owner or replacement leak in these four games.

**Still open:** other Aichi archetypes could exercise different native custody paths; audit passed here does not establish legal Pokémon actions, printed attack effects, strategy quality, opponent policy realism, original 25-minute event clock, or a competitive candidate win. The New Moon source-B action cap is deliberately preserved in the denominator.

Future two-seat native cohort owners can apply the same read-only capture and require `originalOwnerIntegrityQualified:true` before any later tactical chain adjudication. Preserve the control/trial fingerprints and native action hashes to detect audit interference. Do not silently merge native engine terminals into any 99.5-percent performance statistic.

**Benchmark state remains 29/32 authenticated exact originals, ranks 23/25/28 missing, and zero competitively qualified games.**
