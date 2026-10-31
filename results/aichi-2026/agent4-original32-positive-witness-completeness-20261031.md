# Agent 4: native-positive source opportunity witness survives bounded-sample censorship

**31 October 2026 | original rank-6/rank-11 source roots | policy-observability correction**

## Failure caught by independent review

Agent 25's [31 October counterexample](../../communications/agent4/20261031T0313Z_agent25_source32_sample_truncation-counterexample.md) found a real reporting error in the prior [32-arm original Store exposure study](agent4-original32-native-plumeria-flare-exposure-20261031.md). Original rank-6 source trials `6:3:A:champion-reference` and `6:3:A:new-moon-lockbreaker-v1` had respectively **30/22** and **32/19** coheld/native-positive source root counts. Their first eight displayed coheld examples were all native-negative, yet `auditSamplesMayBeTruncated:false`. The previously bounded display falsely suggested that all same-root positive opportunities were missing even though aggregate counters already counted them.

A particularly deceptive failure would arise if the globally retained first 128 contest samples were all native-negative while the 129th or later owner root was native-positive. Filtering for positive examples after applying that global cap can never recover the event.

## Corrected capture and reporting contract

[Passive native owner observer](../../simulation/twinleaf/agent4-plumeria-opportunity.cjs) now captures each seat's **first true original card `canPlay`-positive, paper-screened coheld root**, independent of global first-128 contest examples, plus up to eight positives in a separate per-seat ledger. Each sample includes the actual owner turn and root-observation ordinal, current original chosen action, owner physical two-card Plumeria payment-pair counts, and public Active/Bench Energy target counts. It does not read opponent hidden hand, deck or Prize identities, mutate the Store, or select either alternative.

[Original frozen-frame 32-arm driver](../../scripts/agent4-original32-plumeria-flare-census.cjs) v3 reports `firstNativePositiveSourceWitness`, `sourceExamplesMayBeTruncated`, `positiveExamplesMayBeTruncated`, and `positiveWitnessStatus` on **each observed arm**. `auditSamplesMayBeTruncated` now refers to the arm's own source/positive lists. A positive count without a captured witness is an explicit `POSITIVE_WITNESS_MISSING`. Unobserved native audits are distinguished from true zero-positive arms.

These first-positive records are **native action opportunities**, not independently sampled roots, native Store accepted alternative actions, selected paid costs, full-game outcomes, or strategic efficacy.

## Testing

The [new per-arm receipt regression](../../tests/agent4-original32-contest-evidence.test.cjs) checks the specific 30/22 truncation scenario, global cap starvation, missing-witness fail-closure, true zero-positive roots, seat isolation and invalid audit seats. The [original observer regression](../../tests/agent4-plumeria-opportunity.test.cjs) now exercises 130 native-negative coheld owner roots followed by a positive **131st** root, for **both actor seats**. Its original global first-128 samples contain zero positives; the independent positive ledger retains exactly the actual first positive.

The existing **manual-only** Iron Thorns smoke workflow [run 41231072304](https://github.com/FlareZ123/experiment-01/actions/runs/41231072304) passed all checks and both regression groups at checkout `9ba9e51b124e1b125d9818af2e4c4ee42eeb45f4`. No push-triggered CI or new workflow was added.

A full native 32-arm original Store remeasurement was dispatched under the same frozen 29 October game frame and pinned Twinleaf revision (run [41231104244](https://github.com/FlareZ123/experiment-01/actions/runs/41231104244)); its outcome is tracked separately pending observed completion, and must be checked before claiming the refreshed original-game witness evidence.

## Research boundary

The old **169 coheld, 148 native-positive rank-6 root counts**, 0 rank-11 positives, and nine distinct rank-6 source-opening fingerprints remain *prior original control evidence*. The correction changes reporting fidelity, with no policy-selection intervention, candidate 60 change or newly qualified game. The benchmark is still **29/32** authenticated exact opposing 60s (ranks 23,25,28 unresolved), **zero competitively qualified games**, and no supported 99.5% fixed-60 win-rate result.

The next release step is to align every captured native-positive witness to the original accepted-action ledger and prove at least one consequential, physically settled *alternative* policy choice with the opponent's next real response, under per-root physical-card conservation and adequate source policy.
