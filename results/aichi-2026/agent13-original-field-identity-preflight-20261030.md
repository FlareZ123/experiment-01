# Agent 13: original Aichi Top 32 rank and printed-source identity preflight

**30 October 2026 | normal research | source-provenance invariant, not a competitive trial**

## Problem

A recent rank-11 source report incorrectly named the archetype as Regidrago, although the canonical 2026 Aichi `field.csv` registers rank 11 as Absol Garbodor. The Critic determined that the native rank input was correct in that case; the prose label was wrong. A fixed-deck performance release needs machine-checkable source attribution before native simulation and eventual source-policy arbitration, including exact published printing identity.

## Implementation

- `simulation/evaluation/agent13-source-identity-gate.cjs`: `attestField(manifest,csv)` requires exactly one rank in 1–32 per canonical field row, validates rank/player/archetype and yes/no publication against all source 60s, compares category subtotals and card quantities, rejects ambiguous CSV rows or missing printings, and records a deterministic SHA-256 fingerprint for the original published printing inventory. The fingerprint covers `(category,name,set,number,language,count)`, sorted by Unicode code units. The source attestation also enforces the cross-printing four-copy deck limit with the nine Basic Energy names exempted under the supplied rulebook. It is intentionally separate from the resolved native card-ID array.
- `simulation/evaluation/aichi-pilot.cjs`: `planAichi` calls the gate before `resolveManifest`; it also calls `attestNativePlan` on the 32 native-resolution results, returning an `originalSourceIdentity` receipt with rank, player, archetype, source printing SHA-256, native ordered card-ID SHA-256 (if playable), unresolved status, and native substitution marker. Custom 60 candidates remain permitted because the check applies to the original published field before appending a candidate.
- `attestPhysicalArm` checks each exact original source and fixed candidate against the **immutable native ordered digest captured during `planAichi`**, then verifies the genuine physical seat A/B deck arrays. It returns a per-arm rank, printing digest, native digest, candidate digest and physical seat packet. This helper is available for the single canonical Agent 41 runner to invoke before dispatch. The compiled `agent13-native-plan-attestation-smoke.cjs` checks ranks 6/11 on both physical seats without playing a game.
- `tests/agent13-source-identity-gate.test.cjs`: nineteen pure regressions including rank-11 wrong-archetype, wrong player, incomplete 60, duplicate rank, missing-list drift, publication mismatch, category subtotal corruption, ambiguous field rows, missing printing, and row-order-independent but printing-sensitive fingerprints.
- Existing **manual-only** `.github/workflows/aichi-benchmark-stats.yml` runs these tests without adding a workflow trigger.

## Source-derived results and evidence

At the checked source snapshot, **29/32** published original full decks pass the rank/player/archetype check; every recovered list contains **60 physical cards**, and the **three unresolved ranks are 23, 25, and 28**. All printings in the original manifest have the required set, collector number, and language fields. No duplicate exact printing rows were found. These counts were independently compared against the actual `results/aichi-2026/field.csv` and `full-decklists.json` by this invocation.

- [Manual CI 40980376622](https://github.com/FlareZ123/experiment-01/actions/runs/40980376622): **SUCCESS** at commit `3207123`, including all new pure regressions.
- [Manual CI 40980475955](https://github.com/FlareZ123/experiment-01/actions/runs/40980475955): **SUCCESS** at commit `b6f9aff`, including the early `planAichi` preflight.
- [Manual CI 40980624847](https://github.com/FlareZ123/experiment-01/actions/runs/40980624847): **SUCCESS** after the ICU-independent fingerprint ordering correction.
- [Manual CI 40980874983](https://github.com/FlareZ123/experiment-01/actions/runs/40980874983): **SUCCESS** at `e5a006b`, including the additional native 60 linkage regressions and the new `planAichi` source-identity receipt field. This is a pure/statistical CI suite, not a complete native Store match.
- [Manual CI 40981833986](https://github.com/FlareZ123/experiment-01/actions/runs/40981833986): **SUCCESS** after adding cross-printing four-copy legality and unlimited Basic Energy checks.
- [Manual CI 40982153020](https://github.com/FlareZ123/experiment-01/actions/runs/40982153020): **SUCCESS**, including 19 source and physical-seat integrity regressions. Physical dispatch attestation now rejects changed registered source IDs, candidate IDs and swapped physical 60s.
- [Native CI 40981982259](https://github.com/FlareZ123/experiment-01/actions/runs/40981982259): the **specific compiled pinned-Twinleaf source-identity attestation step passed**. The overall long smoke workflow failed later on a separate, pre-existing Canceling Cologne regression. This must not be advertised as a globally green smoke run.

## Scope and next acceptance obligations

This gate establishes original-source **metadata and published printing inventory identity**. It does **not** prove Japanese Expanded legality, native card-effect fidelity, the equality of a native card-ID deck to its exact original printed roster, hidden-information safety, owner action competence, native opponent response, or real-clock game results.

For a competitive-action chooser release, call `attestPhysicalArm` for the source rank, candidate seat and actual physical deck arrays before every native match, and carry its source printing SHA-256, native ordered 60 digest, source rank, player and archetype into the *same* frozen per-arm evidence packet. Verify that candidate/source seats and policy identity remain distinct, and classify failures without converting action caps or favorable historical game terminals into wins. The shared Agent 41 canonical runner and its integration owner are the intended downstream consumers.

**Benchmark remains 0 competitively qualified games; 99.5% has not been demonstrated.**
