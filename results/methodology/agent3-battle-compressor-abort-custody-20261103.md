# Agent 3: preserve causal Battle Compressor receipts across native aborts

**3 November 2026 | normal research | observer integrity, not deck-strength evidence.**

## Question and failure mode

The original real-Store-only Battle Compressor observer correctly excludes speculative Twinleaf Store clones, but its sole success return used to contain the observation packet. A native `execute()` exception could therefore erase all real-root card, prompt and source-deck movement receipts accumulated before the abort. The enclosing original-deal fingerprint helper, `withDealFingerprint`, further converted exceptions to a bounded stack string. As a result, the full trial denominator could include an error without retaining its earlier causal game evidence.

This matters for failed native attempts and the requirement to preserve every attempted source 60/deal. A receipt is a historical observation, never a qualified game. Losing it makes even unsuccessful mechanisms difficult to distinguish and can select evidence in favor of surviving executions.

## Change, narrowly scoped and default-off

- [Source-root observer](../../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs) now takes a detached audit snapshot at every normal return or exceptional exit. On an Error object, it attaches `nativeSourceCompressorRootAudit` and rethrows the **same** original exception; the `Store.prototype.dispatch` method is restored in `finally`. The abort witness is explicitly `executionDisposition: "NATIVE_ABORT"`, `observationIsPartial: true`, and `competitivelyQualified: false`.
- The audit separates `selectedSourcePlays`, `acceptedSourcePlays`, `linkedPromptsIssued`, `unresolvedLinkedPrompt`, `positiveLinkedSettlements`, actual physical card-object movements, and counted speculative Store dispatches. Accepted-source counts alone do **not** prove printed-paper payment or effect legality.
- `sourceCompressorAbortAudit(error)` extracts the source-specific witness through chained `cause` errors without fabricating one.
- The shared rank26 [physical-deal observer](../../simulation/twinleaf/rank26-natural-pre-koko-cologne-cohort.cjs) now preserves `abortSourceCompressorAudit` alongside the legacy error text and initial physical-deal fingerprint. Both historical [full retrospective](../../simulation/twinleaf/agent3-rank26-compressor-v3-full-retrospective.cjs) and [three-deal selected](../../simulation/twinleaf/agent3-rank26-root-provenance-v3-selected.cjs) runners carry that field into their per-attempt output on exceptional exits. On ordinary returns, the normal success packet is unchanged except for the additive `unresolvedLinkedPrompt` key.

## Regression evidence and scope

The [existing pure test suite](../../tests/agent3-compressor-root-provenance-v3.test.cjs) now includes specific injection of:
1. real settled source prompt and then native abort, in each of the two player seats;
2. rejected owner card play, preserving selected=1 but accepted=0;
3. owner card play with an unresolved prompt when aborted;
4. a clone-only speculative settlement followed by abort, yielding zero genuine source receipts;
5. wrapped errors with a `cause` chain, retaining the original witness.

**Pure GitHub Actions run [41690499623](https://github.com/FlareZ123/experiment-01/actions/runs/41690499623) completed successfully** on head `ba4931a9f9f109ebb78836396cb14e8df4758120`, which includes the source observer and all new tests. This establishes test-fixture behavior for the observer. The existing [native CI run 41690648680](https://github.com/FlareZ123/experiment-01/actions/runs/41690648680) **succeeded** on head `dd2d6c0856315158a59db7df36effe0fc9aa70ec`, which includes the updated native runner transport. Its immutable [artifact 13255933589](https://github.com/FlareZ123/experiment-01/actions/runs/41690648680/artifacts/13255933589) has ZIP SHA256 `0b86d69457643f361374543e30f339d3dd4a9e17b24c1abb0ac5dcc052d1c13a`. The full six historical attempts had **6/6 exact archived physical deal fingerprints, 0 native errors, 0 baseline real prompt settlements, 4 treatment real prompt settlements**, and 0 qualified games. Every returned normal audit has `unresolvedLinkedPrompt: false` and `abortSourceCompressorAudit: null`. This verifies ordinary native integration without exercising an actual native exception. No new CI workflow was created.

## New compiled native abort-side custody witness

[CI 41691706560](https://github.com/FlareZ123/experiment-01/actions/runs/41691706560) **succeeded** at head `34ee2f796579e2d8d5d2c7039698fdbf99d1be6e`. The source fixture [agent3-rank26-native-abort-custody-witness.cjs](../../simulation/twinleaf/agent3-rank26-native-abort-custody-witness.cjs) deliberately throws **after** a real Store has finished the owner source Compressor deck-to-discard prompt, using an unchanged registered historical rank26-vs-rank6 original physical deal (seed 4195563994, source seat 1). This is one *injected diagnostic fault*, not an original tournament/game exception and not an additional candidate match. All ordinary six historical replay arms also passed at the same head.

[Archived raw native abort JSON artifact 13258200055](https://github.com/FlareZ123/experiment-01/actions/runs/41691706560/artifacts/13258200055) ZIP SHA256 `3e56d16ee9722f2220dcf82c77be9f8a42dacea5b5b6d0a19907a64cd67f461f` proves that both the source observer and physical-deal outer wrapper kept the evidence when the original exception escaped. Its initial physical fingerprint exactly matches the frozen archive. The recovered partial audit reports: selected 1, dispatch-returned 1, linked prompt 1, positive physical settlement 1, unresolved prompt false, and speculative Store dispatches 0. The physically moved original source cards are two Lightning Energy MEE and one Exeggcute PLF. The result explicitly states `NATIVE_ABORT` and 0 qualified games. The injected fault was placed *after* physical prompt settlement, so it does not test partial reducer movement from an exception thrown inside the reducer itself.

## Failed delegated Store dispatch after physical movement

[Dual-mode compiled native CI 41692712298](https://github.com/FlareZ123/experiment-01/actions/runs/41692712298) **succeeded** on head `e271b52a51a47ed85c2f8a738db408560001b302`. Its immutable [artifact 13259180165](https://github.com/FlareZ123/experiment-01/actions/runs/41692712298/artifacts/13259180165), ZIP SHA256 `7212441313a4fee2fec87f58c1a7495c376f4fed3ad8ffba84cec9837ee1c68e`, contains two deliberate fault placements on the **same** original source 72:B physical deal. Both recover exactly the same three physical cards and the same original physical opening:

| Original-source fault position | Native delegated dispatch returned? | Physical movement captured? | Positive accepted settlement | Failed prompt dispatch |
| --- | --- | --- | --- | --- |
| External hook throws after source observer already recorded success | Yes | 3 cards | 1 | 0 |
| External hook throws after Store movement but before source observer returns from delegated dispatch | No | 3 cards | **0** | **1** |

The second is a deliberately injected outer-hook exception after physical movement, which models the observer-facing failure shape of a partially committed native reducer. The [observer](../../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs) now captures this movement in `finally`, records `nativeDispatchReturned:false`, `physicalMovementDuringFailedDispatch:true` and `paperMinimumMet:false`, preserves the original exception and returns an abort audit through the outer fingerprint wrapper. Thus physical movement on a failed dispatch is retained while **not** promoted to accepted printed-paper payment. The [pure unit tests](../../tests/agent3-compressor-root-provenance-v3.test.cjs) separately cover failed dispatches with movement and zero movement. All two injected cases and six ordinary historical replay arms have zero competitively qualified games. This does **not** demonstrate that the actual Twinleaf reducer throws at this location during natural games.

## Independent printed cost boundary

The supplied card corpus contains Battle Compressor Team Flare Gear `xy4-92`, with printed text requiring a search for **up to three** cards and discard. The supplied Advanced Player's Rulebook D-05 treats a Trainer's "up to" choice as **one to the stated bound**. A native `ChooseCardsPrompt.options.max` is only a simulator assumption; it cannot override the printed three-card maximum. The observer now checks the independent printed range `1..3`, retains native prompt min/max separately, and records both printed bounds. [Pure CI 41692074541](https://github.com/FlareZ123/experiment-01/actions/runs/41692074541) **succeeded** at head `beef4121427504d4f51e5f99e178e9883ea6e578`, including new synthetic zero-, one-, three- and four-card movements against a deliberately overpermissive native maximum of four. The three-card scenario remains valid; the four-card scenario is paper-invalid. The real native abort witness above ran on the earlier head before this additive print-bound correction, with an actual three-card movement.

**Limits:** This injected failure reproduces an observer-visible throw after native movement; genuine unexpected reducer failures, rollback behavior and other prompt families remain separately unverified. This is an observer-custody qualification only. No paper-qualified opponent decision, certified game clock, or win rate follows. Original admission remains **29/32 source lists, zero competitively qualified games, and no selected fixed 60**.

**Release recommendation:** Every runner or higher-level field evaluator that catches an Error should retain attached source-specific audit data with the original error and physical-deal identifier. Do not exclude aborted arms or reclassify a partial positive settlement as an ordinary completed game.
