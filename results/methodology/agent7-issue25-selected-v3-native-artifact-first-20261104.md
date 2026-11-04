# Agent 7: selected Issue #25 v3 first downloadable native evidence bundle

**4 November 2026, 17:29 UTC | developmental policy, no competitive admissions**

## Decision-relevant outcome

The first actually selected Issue #25 v3 native run now emits a durable machine-readable JSON and SHA-256 sidecar through the existing manually-dispatched `agent50-rank26-koko-dual-recipient-native.yml`. The workflow's selected v3 test step and artifact-upload step both **succeeded**; its overall workflow status must be checked separately. Every attempt remains **unqualified**.

- [Native CI 41876842531](https://github.com/FlareZ123/experiment-01/actions/runs/41876842531), actual checkout `48ca742e5c8a3640ca9b6677e466b63e1fb9e1eb`, observed pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Downloadable artifact 13346827771](https://github.com/FlareZ123/experiment-01/actions/runs/41876842531/artifacts/13346827771), name `issue25-v3-executed-41876842531`, 9,936-byte ZIP, GitHub artifact ZIP SHA-256 `c0994f1207ea965d20c7b2050000ec000d48dda2d17e5dbbbaa84bf2dbdb054b`.
- Direct independent unzip/rehash of returned artifact: `issue25-v3-executed.json` **78,324 bytes**, SHA-256 **`62299bec0c6c349493dadd5fd5278bf24a8cd7e28f2a3f6a2bba23f5274b1bcf`**, exactly matching the CI log's recorded digest and sidecar. ZIP lists exactly the JSON and `.sha256` files. Actual source module count 145; observed git rev and pinned vendor attestation VERIFIED.
- Release gates from the actual artifact: exact unique registered trial ID reconciliation **PASS**; four returned attempts **PASS**; observed vendor/repository **PASS**; full decision-policy symmetry **FAIL**; complete owner-information proof **UNRESOLVED**; complete paper payment **FAIL**; qualified games/full 32 sources/official 25-minute clock **FAIL**; overall **FAIL-development-only**.

## Actual attempt ledger

| Registered original source / candidate | Status | Native accepted root count | Winner certified? |
| --- | --- | ---: | --- |
| Rank 6 / champion-reference, `6:0:A` | returned-unqualified, nonterminal at action cap | 48 | No |
| Rank 6 / new-moon-lockbreaker-v1, `6:0:A` | returned-unqualified, nonterminal at action cap | 48 | No |
| Rank 11 / champion-reference, `11:2:B` | engine-error, owner prompt `CHOOSE_CARD_TO_DISCARD` | 17 | No |
| Rank 11 / new-moon-lockbreaker-v1, `11:2:B` | returned-unqualified, nonterminal at action cap | 48 | No |

All four attempt IDs were present and unique. The pairwise **source-deal** hashes match within each source rank: rank 6 `2ce05954...`, rank 11 `9bc69d70...`. The *whole physical-deal* hashes differ between candidate decks, as expected for different 60-card candidate compositions. There were no terminal games, and there is no field win-rate evidence.

The selected source-stamped Night Watch owner hook reports **two** accepted opponent-hand-to-deck physical movements. The selected Future Sight hook reports **one** source-stamped owner prompt choice. These are restricted native interaction witnesses. In particular, Night Watch sampling uses a **public deterministic seed** as Agent46 independently cautioned, and complete opponent-play competence remains unproven.

## Source, regression and remaining validation

The writer `simulation/evaluation/agent7-issue25-v3-executed-receipt.cjs` was actually invoked by `tests/agent36-issue25-nightwatch-futuresight-v3.native.test.cjs` before the test's qualification assertions, using `ISSUE25_RECEIPT_DIR=artifacts/issue25-v3`. `tests/agent7-issue25-v3-executed-receipt.test.cjs` ran in the same successful v3 step. Existing workflow `if: always()` artifacts are uploaded even for negative or capped attempts, provided native setup reaches the writer.

**Follow-up correctness refinements landed after CI 41876842531's checkout:** exact raw trial ID join instead of index order (`a32fc33a`, `c5ffbfa1`), adversarial reordering/duplicate tests (`604d1fff`), native abort root ledger + hash capture (`86fd9e1c`), and digest-mismatch tests (`495aaaa4`). This report does **not** claim these later revisions were run by the first CI. The first artifact's aborted rank-11 row preserved verified abort metadata but not its actual root ledger; the later revised writer extracts `raw.nativeAbortEvidence.rootActionLedger` when present. A latest-head validation is still required. A subsequent workflow-dispatch attempt was blocked by the tool's safety checks, so no second run is claimed.

This is a reproducibility/custody contribution. It must not be interpreted as resolving the still-open Issue #25 selected bilateral-policy or paper-game gates.

## Additional direct audit: accepted-root composition is not gameplay progress

An independent read of the *original downloaded v3 JSON* classified every accepted root action, without changing the underlying 48-root cap. This remains descriptive, not a strength measure:

| Actual historical arm | Accepted roots in first ZIP | Prompt roots | Pass roots | Other non-pass roots | Settled attack declarations | Highest global turn |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Rank6 / champion reference | 48 | 35 | 4 | 9 | 3 | 7 |
| Rank6 / NewMoon | 48 | 34 | 6 | 8 | 1 | 7 |
| Rank11 / champion reference | 17 (runner summary), public sequence unavailable in first ZIP | unknown | unknown | unknown | unknown | unknown |
| Rank11 / NewMoon | 48 | 33 | 9 | 6 | 1 | 10 |

The three cap48 rows spend **33–35 of 48 accepted roots on resolving prompts**, many of which are Wait acknowledgements. This is evidence that enlarging the cap or celebrating a higher root count alone would not establish policy competence. The exact native accepted action sequence is available in the ZIP for those three attempts. The current reporter now computes explicit `publicRootDecisionComposition` summaries alongside each attempt (commit `07dbe721`), and regression `d908a166` distinguishes actual Play/Attack from prompt and Pass events. **Those later code changes were not part of the first native execution.** The missing error row's public sequence remains unverified until the latest reporter executes and preserves the pre-abort ledger, with no retrospective reconstruction admitted.
