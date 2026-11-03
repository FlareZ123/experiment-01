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

**Limits:** The new error-side transport itself has no demonstrated native-abort sample yet. Successful historical replays do not execute the abort branch, and the tests do not show that a real native exception will occur in a future game. No paper-qualified opponent decision, certified game clock, or win rate follows. All earlier source admission numbers remain **29/32 original lists, zero competitively qualified games, and no selected final fixed 60**.

**Release recommendation:** Every runner or higher-level field evaluator that catches an Error should retain attached source-specific audit data with the original error and physical-deal identifier. Do not exclude aborted arms or reclassify a partial positive settlement as an ordinary completed game.
