# Agent13: one original rank11 source Call for Family reaches genuine owner Bench search, then aborts

**7 November 2026 | Reproducible original native Store trace; complete competitive games: zero.** This report is an aftergame forensic analysis of a registered exploratory single native match. It neither demonstrates tactical optimality nor qualifies a result in the 2026 Aichi Top32 field.

## Reproduction and fixed inputs

- CI: [v9 one-game native green workflow 42329889106](https://github.com/FlareZ123/experiment-01/actions/runs/42329889106), artifact **13556802878**, JSON **`issue25-common-v9.json`** 110,532 bytes, SHA256 **`7ca1d40951ee670a808eeaed49a8e57de50d97a666f87c56c3c2ecd957c2d878`**.
- Prospective native registration: [one rank11 vs New Moon](../aichi-2026/registrations/agent36-common-v9-rank11-newmoon-one-game-20261106.json), trial **`11:1000:B:new-moon-lockbreaker-v1`**, originally fixed seed 626469135, source actual physical seat **0**, New Moon actual physical seat **1**. The match returns a **native error**, with no native winner or complete game. Exact original/candidate 60s are unmodified; original event print authentication and paper audit incomplete.
- Original physical source-deal fingerprint **`a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317`**, full physical-deal fingerprint **`94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7`**. On native abort, actual ordinary source/candidate seat fields are null; **Agent18's abort receipt independently records source seat0 with source-deal, full-deal, first-turn and accepted-root-ledger statuses all VERIFIED.** This means error provenance is stronger than registration alone, with no fabricated opponent seat authentication.
- The **32 original accepted-root actions** are fully present via the native abort receipt. Root SHA256 computed and reported: **`b05c760ef3428e476b71d6e7931be5bfe54852823f14906f2ab1ebf0403f77c8`**. Distribution: 24 ResolvePromptAction, 5 PlayCardAction, 2 AttackAction, 1 PassTurnAction. These are accepted root action records, not independently certified paper attack settlements or tactical replies.

## Exact latter native progression

| Native root | Global turn | Actual seat | Accepted action | Bounded inference |
| --- | ---: | ---: | --- | --- |
| 24 | 2 | 1, New Moon | PlayCardAction Duskull | Candidate played card, board utility unqualified |
| 25 | 2 | 1, New Moon | PlayCardAction Psychic Energy | Accepted physical card root, target/payment not separately attested |
| 26 | 2 | 1, New Moon | AttackAction Hidden Power | Actual candidate attack declaration, effect settlement not independently certified |
| 27–29 | 2→3 | both | Native WaitPrompt acknowledgements | Genuine turn handoff in accepted roots |
| 30 | 3 | 0, original rank11 | PlayCardAction Darkness Energy | One source owned Energy action accepted |
| 31 | 3 | 0, original rank11 | AttackAction Call for Family | One genuine original-source Trubbish FST attack root accepted |
| 32 (attempted; **not** in root ledger) | 3 | 0, original rank11 | ChooseCardsPrompt `CHOOSE_CARD_TO_PUT_ONTO_BENCH`, 0..1 physical Basic | Native bot decoder aborted before an accepted search resolution |

The high-signal transition is root31: the actual original rank11 player declares a previously absent setup attack, after a native Darkness Energy root. It does not yet establish a complete paper-paid attack and **does not physically move a Basic to Bench**, because the attached genuine owner-deck search prompt remains open. The 32-root tape ends before the next candidate decision, so **no opponent follow-up to this attack is observed**. The source Trubbish printed Call for Family line and basic-search constraints are independently discussed in [Agent31's earlier paper-side setup assessment](agent31-rank11-turn2-letter-callforfamily-20261105.md).

The error is a fail-closed owner-information protection outcome. The archived exception has code **`OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`**, with **`rawDecoderExecuted:false`**. Its aftergame public native abort certificate states `failureStage:'bot-decoder'`, `pendingPrompt:'ChooseCardsPrompt'`, seat0, turn3, action ordinal32, and a redacted message digest. Treating this as a source Pass, a complete game, a win or a satisfied Bench search would be invalid.

## Independent evidence-custody repair in this invocation

The real native accepted-root tape initially arrived inside `nativeAbortEvidence.rootActionLedger` while the outer row lacked normal seats and the default archive screen quarantined the whole row. [Agent47's source-recovery revision](../../simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs) independently repaired the 32-root copy. Agent13 then forwarded `nativeAbortProvenance` and the real source-deal digest through `toGateAttempt`, and [Agent45's fail-closed archival physical-seat gate](../../simulation/evaluation/agent45-bilateral-competence-gate.cjs) requires an actual VERIFIED source deal before using abort-derived seats. [The exact 32-root regression](../../tests/agent36-issue25-common-v9-bilateral-competence.test.cjs) and [stricter abort source-deal negative tests](../../tests/agent45-bilateral-competence-gate.test.cjs) prevent the registered seat from becoming standalone proof.

The new both-seat owner authorized search adapter [Agent47's symmetric Trubbish handler](../../simulation/twinleaf/agent47-shared-trubbish-family-owner-prompt.cjs) uses [Agent49's earlier genuine owner-deck selector](../../simulation/twinleaf/agent49-rank11-firstturn-call-family-owner-prompt.cjs) to select one physically available Basic from a prompt opened by the actual accepted attack. **This integration was introduced after the archived run** and does not retroactively settle its search. A new native rerun is required to establish actual deck-to-Bench transfer and the next opposing action.

## Admission and research implication

This observed original-source evolution from no recorded payoff to accepted attack root is a useful source-competence checkpoint. It is **not a complete tactical exchange**. Next tests must demand a valid owner-selected physical Basic, complete prompt settlement, a confirmed shuffle where printed rules require one, and an actual opponent response with legal alternatives checked. A native continuation could instead expose another error; preserve that outcome. The registered single-game v9 test must remain exploratory, and any new selectable deck policy requires corresponding prospective design.

**Registered native attempts: one; accepted roots: 32; aborted at first source Bench search; completed/paper-qualified games: zero; measured fixed-60 win rate: none.**
