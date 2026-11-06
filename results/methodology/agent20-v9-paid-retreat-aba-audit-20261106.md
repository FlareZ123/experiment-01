# v9 paid-retreat A/B/A audit: treatment flag dropped and exact replay

**Agent20 | 6 November 2026.** This report records the first native v9 common-policy paid-retreat A/B/A run. It is a methodological audit with no evidence about competitive strength.

## Run identity and provenance

- Workflow run: 42246115429
- Workflow: Twinleaf bounded full-match probe
- Native artifact: 13519261081
- Artifact internal archive SHA256: f91552274c354e54226b315ff3ca9e39ddfa7dc3cf3096b2ea863a0d3d602bc4
- Uploaded ZIP SHA256: 0c69696de15c66d0dcad6a6d75a88f9fdd63e4f8825bf82e2dd7f7cf4c3f458e
- Registration: results/aichi-2026/registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json
- Runner: simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs
- Native test: tests/agent36-issue25-common-v9-paid-retreat-aba.native.test.cjs
- Twinleaf pin: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05

The run executed three phases over the same eight registered candidate contexts: A-v8-control, B-common-paid-retreat, and A-repeat-control. It returned all eight IDs in each phase, for 24 total attempts.

## Observed outcome

| Phase | Returned rows | Native finishes | Decoder aborts | Root-128 caps | Paid-retreat roots | Custody-bound retreats | Follow-on attacks | Prize-taking attacks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A-v8-control | 8 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |
| B-common-paid-retreat | 8 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |
| A-repeat-control | 8 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |

The archive reports zero RetreatAction roots, zero public paid-retreat transitions, zero physical custody receipts, zero settled follow-on attacks, zero Prize-taking follow-on attacks, zero terminal wins, and zero competitively qualified games.

## Primary defect: B treatment flag was dropped

The historical adapter at commit 7ea8479c6acda71916aade2f28f73065a50b7c88 accepts and validates `actorTwoUnitPaidRetreatRoot` in `runDevelopment`. Its trial loop adds `twoUnitPaidRetreatRoot:true` and the target turn to the options object passed to `executeDevelopment`.

The `executeDevelopment` parameter list does not destructure either property. Its call to the actor-only root-policy wrapper therefore receives neither option. The wrapper never activates the paid-retreat selector in B. The manifest records the requested mode, while the native policy wrapper runs the same configuration in all three phases.

This explains the complete absence of treatment divergence. The v9 run is effectively A/A/A. Its zero retreat count cannot be interpreted as a policy rejection or a strategic failure.

## Exact A/B/A replay evidence

I downloaded and parsed artifact 13519261081 and compared the complete root ledgers, including the abort evidence.

All eight registered trial seeds are identical across A, B, and A-repeat:

| Trial family | Seed |
| --- | ---: |
| Rank 11, candidate slot A | 517355142 |
| Rank 1, candidate slot B | 1084952875 |
| Rank 3, candidate slot A | 948758444 |
| Rank 6, candidate slot B | 2950430245 |

For all eight rows, the source-deal and full-physical-deal fingerprints match across all three phases. The complete root-action ledgers also compare equal across A/B/A:

| Trial | Root-ledger length in each phase | A = B = A-repeat |
| --- | ---: | --- |
| 11:211:A:champion-reference | 128 | Yes |
| 11:211:A:new-moon-lockbreaker-v1 | 88 | Yes |
| 1:212:B:champion-reference | 98 | Yes |
| 1:212:B:new-moon-lockbreaker-v1 | 128 | Yes |
| 3:213:A:champion-reference | 106 | Yes |
| 3:213:A:new-moon-lockbreaker-v1 | 93 | Yes |
| 6:210:B:champion-reference | 128 | Yes |
| 6:210:B:new-moon-lockbreaker-v1 | 118 | Yes |

The five decoder-abort rows retain their accepted root ledgers under `nativeAbortEvidence.rootActionLedger`. The v9 summary function only reads the top-level `rootActionLedger`, so it emits null hashes for these rows. The resulting `controlsRepeatedExactly:false` aggregate is a reporting defect. It does not describe an observed action-ledger mismatch. The three ordinary capped rows have matching top-level ledger hashes, and all five abort rows have matching ledgers in the abort evidence.

The archive also reports `controlRootDifference:null` and matching physical openings for every trial. These fields agree with the complete-ledger comparison.

## Five deterministic decoder quarantine aborts

The five error rows share exception digest:

`2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`

Their abort evidence records the same failure path through `agent4-raw-state-native-fallback-quarantine.cjs` lines 45 and 66, followed by the prompt wrappers and `agent30-attack-printed-choice-provenance.cjs` line 111. The pending prompt types are two `ChooseCardsPrompt` instances and three `ConfirmPrompt` instances. The failures occur at root ordinals 88, 98, 106, 93, and 118.

The quarantine deliberately throws when an unresolved prompt reaches the original raw-State bot decoder. These rows therefore indicate missing owner-safe prompt coverage. They are policy-boundary aborts. The archived evidence does not establish a Twinleaf rules-engine failure.

## Randomness and cross-phase state

The manifest records `legacy-shared-prng`, with policy and physical-shuffle isolation disabled. That protocol remains unsuitable for future treatment comparisons because policy draws can consume the same random stream as game events. It did not cause the observed A/B/A equality in this run. The treatment flag was absent, and all complete ledgers match.

The historical execution path shows no mutable policy state reused across the three `runStewardBroaderV8` invocations:

- Each `runDevelopment` call creates a fresh prepared-candidate Map and row collection.
- Each trial creates a new native match and passes its registered `trial.seed` to `headless.runMatch`.
- `headless.runMatch` creates a fresh seeded generator and restores the previous `Math.random` in `finally`.
- The v4, v5, v6, v7, and custody wrappers use invocation-local audit state and restore their prototype or environment hooks in `finally`.
- The module-level action-metadata WeakMap in the actor-only policy is keyed by newly created native action objects. It does not carry policy decisions between matches.

The identical seeds, physical deals, and complete A/B/A ledgers provide direct confirmation that no cross-phase state drift affected these runs.

## Horizon limitation

The v9 registration uses a 128-root cap. The previously observed Agent42 positive retreat occurs at root 131, its Eon Blade settlement at root 132, and the final Prize/native terminal at root 134. The cap would have prevented that witness even if the treatment flag had reached the policy wrapper.

The horizon is a secondary blocker. The primary defect is the dropped treatment flag.

## Correct classification

**NO TREATMENT APPLIED / A = B = A-REPEAT / EXACT REPLAY / FIVE POLICY-DECODER QUARANTINE ABORTS / THREE ROOT-128 CAPS.**

This run provides no strategic evidence about the paid-retreat policy. The `controlsRepeatedExactly` summary flag should be corrected to include abort-evidence ledgers, and error-censored coverage should be reported separately.

## Minimum requirements for a successor

1. Destructure `twoUnitPaidRetreatRoot` and `twoUnitPaidRetreatTargetTurn` in `executeDevelopment`, then pass them to the actor-only root-policy wrapper.
2. Add a request-level policy activation receipt proving the v2 selector was active in every intended B match.
3. Update summary and comparison code to use `nativeAbortEvidence.rootActionLedger` when an aborted row has no top-level ledger.
4. Report decoder-abort coverage separately from root-cap completion.
5. Use a root cap of at least 135; 240 remains the appropriate registered horizon.
6. Enable isolated policy and physical-shuffle random streams for a treatment that actually changes decisions.
7. Require at least one non-vacuous treatment divergence whose first changed action is an accepted Store RetreatAction.
8. Bind exact physical Energy object identities to that same accepted root and verify their destination.
9. Verify that the promoted Pokémon is the attacker in the follow-on settlement.
10. Require the settled attack, damage/Prize transition, opponent's next consequential decision, and source continuation.
11. Extend owner-safe prompt coverage for the two unsupported `ChooseCardsPrompt` and three unsupported `ConfirmPrompt` aborts.

## Competitive status

The run has zero competitively qualified games and no win-rate estimate. The project still has 29/32 authenticated original opponent inventories, no selected final fixed 60-card deck, and no demonstrated 99.5% game win rate.

**Confidence:** high for the seed, deal, ledger, root-count, and failure-path comparisons from the native artifact. No inference about strategic performance is justified.
