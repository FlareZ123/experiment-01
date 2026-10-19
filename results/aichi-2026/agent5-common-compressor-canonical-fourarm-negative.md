# Canonical four-arm common Battle Compressor integration: unchanged source-dealt actions

**Agent 5, 19 October 2026 UTC. Classification:** compiled, same-physical-source-deal historical policy-regression experiment. This is not a prospective bilateral-v2 sample and contains **zero competitively qualified games**.

## Question and unmodified baseline

Does enabling the preexisting actor-visible `newMoonAttackPayloadCompressorSeat` setup tactic for **either** fixed candidate, without inspecting candidate identity, correct the canonical New Moon's absent attack preparation on the two hard-ranked developer-selected source deals?

Canonical baseline: [Agent41 bilateral v2 development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), the [identical shared candidate resource wrapper](../../simulation/evaluation/agent41-bilateral-common-policy.cjs), and the [Agent10 previous compiled guard checkpoint](agent10-active-bilateral-v2-integration-state-20261019.md). It preserves the 60-card champion and New Moon printed proxies, the exact rank6 and rank11 source 60s, their source-side decision adapters, final owner-visible play-lock guard on both seats, and 260-root cap. The owner-deck prompt resolver and existing Compressor action were already available through `simulation/twinleaf/headless.cjs`; this experiment **only enables** that research-side option uniformly for the candidate actor. Both candidates receive the same setup test by physical seat. The ordinary Twinleaf bot remains unqualified and potentially hidden-opponent-information-sensitive.

## Executable change and reproducibility

- [Opt-in adapter in canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs): `commonPayloadOption(candidateSeat,enabled)` yields `{newMoonAttackPayloadCompressorSeat:candidateSeat}` when enabled and `{}` otherwise. `AGENT5_COMMON_COMPRESSOR_DEV=true` enables it, preserving baseline behavior with no environment flag. Integration commit [`9d2c66de`](https://github.com/FlareZ123/experiment-01/commit/9d2c66de1b25a5725f56cf809fc6e67542505b96).
- [Pure same-seat-on/off regression](../../tests/agent41-bilateral-v2-development.test.cjs) added, no change to original trial selection. [Manual-only existing Compressor workflow](../../.github/workflows/newmoon-compressor-source-partitions.yml) runs **both** canonical four-arm variants and asserts that each matching trial ID, seed, physical source deal digest and actual first seat remain the same.
- Manual compiled [CI run 39334611748](https://github.com/FlareZ123/experiment-01/actions/runs/39334611748) **success**, main research commit `10c05d481742e47871abc283c069e2339073445a`, pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **22/22** focused Node regressions passed.
- [Archive 12226307087](https://github.com/FlareZ123/experiment-01/actions/runs/39334611748/artifacts/12226307087), ZIP SHA-256 `27d65bce2c2650ac97c9766dc342530542d2b177c0b8f695c08e0e89d43fd80a`, 21,454 bytes and ten-day retention. It contains unfiltered `agent5-bilateral-baseline.json` and `agent5-bilateral-compressor.json`. All cap/error fields, attacks, owner-response and source-opportunity evidence remain archived.

Two **retrospectively selected** paired physical streams, four candidates per treatment, eight Store game attempts total:

| Stream, printed candidate | Candidate/source slots | Root actions baseline / opt-in | Source attacks baseline / opt-in | Candidate attacks baseline / opt-in | Outcome classification |
| --- | --- | ---: | ---: | ---: | --- |
| Rank6 `407516727`, champion reference | A/B | 90 / 90 | 1 / 1 | 3 / 3 | Engine terminal, unqualified |
| Rank6 `407516727`, New Moon | A/B | 260 / 260 | 6 / 6 | **0 / 0** | Both action-capped |
| Rank11 `623585882`, champion reference | B/A | 224 / 224 | 4 / 4 | 1 / 1 | Engine terminal, unqualified |
| Rank11 `623585882`, New Moon | B/A | 260 / 260 | 22 / 22 | **0 / 0** | Both action-capped |

**All four baseline/opt-in root-action SHA-256 digests matched exactly**, confirmed on compiled CI after actual Store execution. Candidate-specific opportunity conditions may be unmet; action equality does not by itself prove how the decision scorer ranked any unchosen card. There was no observed beneficial action and no observed policy harm on these two old deals. The actual source-first flag was false in all four arms, so these do not test balanced starting roles. Do not infer a win rate from the two engine terminals.

## Interpretation and next executable falsification

The currently enabled original `shouldSeekPayload` tactic requires **Active Mewtwo & Mew-GX**, a held Battle Compressor, early turn (through global turn 6), an unlocked Item window and an owner Bench/discard without Gengar & Mimikyu-GX. These conjunctions are narrow. [The independent twelve-source-deal rank11 study](../twinleaf/agent35-rank11-compressor-partition-recovery.md) previously found **zero Compressor plays in 24 paired arms**, and no overlap of held Compressor and Active Mewtwo among its first-five-turn owner snapshots. That independent null control is consistent with our 4-arm no-divergence result. It is not proof of future universally zero opportunities.

[Agent32's native owner-prompt positive control](../twinleaf/agent32-newmoon-compressor-owner-prompt.md) proves a targeted donor-to-discard operation can resolve in a specifically prepared authentic Store state, including held-Gengar/Trevenant selection. As of this experiment, Agent32 has also committed an **optional** `allowBenchedMewtwo` predicate for anticipatory owner-zone preparation; the canonical runner has **not** enabled it. Coordinate that upcoming variant with Agent10's one canonical runner rather than create independent match campaigns. The first warranted comparison is a genuine original-deal owner snapshot in which the legal proactive setup can act while Mewtwo is Benched, with real Item dispatch and closed owner-deck prompt, then observable relevant copied attack and opponent reply. Hold fixed seed/printing/actor policy and retain no-opportunity cases. Expanding to new deals must wait for the integrated owner-information and native Store qualifications.

**No claimed competitive game, archetype superiority, changed strongest deck, 99.5% performance, or paper-clock certification.** Published opposing 60s remain 29 of 32; ranks 23/25/28 are unavailable.
