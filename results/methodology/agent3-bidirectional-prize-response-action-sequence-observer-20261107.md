# Bidirectional Prize-response action-sequence observer

**Agent 3 | 7 November 2026**

## Question

Can a read-only native Store observer capture the response sequence after a physical Prize-taking event when either registered side may be the Prize-taking player?

The original observer only recognized the fixed direction in which the original source player took a Prize and the candidate responded. Root93-style probes require the opposite direction: the candidate takes a Prize and the original source player responds.

## Implementation

The research-owned helper is `simulation/evaluation/agent3-postprize-response-action-sequence.cjs`.

- `createPostPrizeResponseActionSequenceObserver` now accepts `prizeTakingSlot:'source'|'candidate'`. The default remains `'source'`, preserving the original source-Prize → candidate-response behavior.
- The observer maps registered source/candidate seats to stable player IDs on the first two-player Store state. It compares actual Prize card objects by identity, so player-array reordering and Prize-array replacement do not invalidate the causal event.
- The observer detects the Prize-taking actor and the responding player independently. It captures only the responding player's own hand/discard printings, deck count, Prize count, unresolved prompts, and public board after successful Store dispatch.
- Each sequence now exposes generic direction fields: `prizeTakingSlot`, `responseSlot`, `prizeTakingSeat`, `responseSeat`, `prizeTakingPlayerId`, `responsePlayerId`, `prizeTakingTurn`, `responseTurn`, and `prizeTakingRootOrdinals`.
- Existing role-specific fields remain available. In the default direction, `sourcePrizeRootOrdinals`, `sourceTurn`, `candidateTurn`, and `firstCandidateResponseRootOrdinal` retain their original meanings. Reverse-direction output additionally uses `candidatePrizeRootOrdinals` and `firstResponseRootOrdinal`.
- `joinPostPrizeResponseActionSequences` accepts both the legacy candidate-response projection fields and generic response fields (`responseOwnerSeat`, `responseNativeTurn`, `firstResponseRootOrdinal`, `causalPrizeTakingRootOrdinal`). It still requires the exact registered physical Prize root and the actual root-ledger action row for every captured action.

The observer is read-only. It does not modify policy inputs, expose either player's hidden hand to the other policy, or infer paper legality from Store acceptance.

## Regression coverage

The pure test file is `tests/agent3-postprize-response-action-sequence.test.cjs`.

Existing default-direction tests cover:
- physical Prize-card identity across player-array reordering;
- multiple Prize exits in one turn;
- a Prize exit with no response action (pending evidence);
- completed response by Pass / turn transition;
- action-capped response remaining explicitly incomplete;
- exact causal-Prize-root and first-response-root joins, including a negative mismatched-root case.

New reverse-direction tests cover:
- candidate Prize-taking followed by the original source's response, including a source response that is action-capped and remains explicitly incomplete;
- multiple Prize exits in one Prize-taking turn;
- pending candidate Prize-taking with no source response yet;
- source response completion by Pass;
- joining the source response to the exact candidate Prize-taking root.

## Validation status

The first current-main manual run, **42377350117** (head `78174b2b45ef986dbe5bc53ab3a785e8e33c8962`), executed 40 tests: **39 passed, 1 failed**. Agent41 identified the sole failure as a stale legacy pending-evidence assertion: the generic pending object lacked `sourcePrizeRootOrdinals`. The helper was corrected to preserve generic `prizeTakingRootOrdinals`, role-specific pending aliases, the legacy default `sourceTurn`, and source/candidate IDs in Prize-change diagnostics.

The follow-up current-main manual run, **42377951338** (head `a9f7177ed151538b1a39a2d05d878643459a29cb`), completed successfully: **40/40 tests passed**. Agent41 confirmed the bidirectional response, exact Prize-root join, pending/capped behavior, and post-action hand-delta tests are green. This establishes pure observer regression coverage only. It does not certify a native full game, paper legality, or competitive strength.

The existing manual-only workflow `.github/workflows/agent3-native-pre-attack-pure.yml` already runs this pure test file. Historical run **42367523652** passed the earlier v2 suite on commit `8ffb27d8c3c6ed018d143d50eb317a1ff7200ab9`; current-main run **42377951338** is the relevant 40/40 green run for the bidirectional extension.

The extension and tests were committed as:
- helper: `4562e405367732a0e67b2237304ca64e56827ae7`
- reverse-direction tests: `2bc60e326e7d97b309c7ff47e81a5fe32ec78976`
- post-play hand-state fixture correction: `5f4a88f444a483b7fd6dfe9e344f4b90d7298ac0`

The existing manual workflow should be dispatched against the current main head before the helper is treated as CI-validated. No new workflow or push trigger was added.

## Limits and next use

This observer measures native post-dispatch state and action chronology. It does not establish paper-valid costs, opponent strategy quality, full-game completion, or competitive matchup strength. A response that has no accepted root remains pending; a response that reaches an action cap remains explicitly incomplete.

The next integration target is the existing Agent20 A/B/A runner, using the generic direction fields for both source-Prize and candidate-Prize branches. Preserve exact physical Prize roots, registered trial identity, responding-seat information boundaries, and all incomplete/censored statuses. Do not use this telemetry alone as evidence of a deck win-rate improvement.
