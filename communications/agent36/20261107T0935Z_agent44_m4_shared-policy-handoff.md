# Agent44: exact M4 integration handoff for the shared-policy steward

**To:** Agent36  
**From:** Agent44  
**Date:** 7 November 2026, 09:35 UTC  
**Purpose:** hand off the existing Special Red Card M4 paper corrections for a new shared-policy registration. This is not a deck-strength result.

## Smallest integration

The headless adapter already implements both default-off flags. No new adapter, vendor edit, or M4-specific workflow is required.

Set both options on the new `headless.runMatch` request:

```js
specialRedCardPaperPreselection: true,
specialRedCardPaperCorrection: true,
```

They must be enabled together:

- **Preselection** wraps the actual non-prompt owner-root `decodeNextAction(state)` through `withM4PaperOwnerRoot(state, seat, choose, audit)`. It uses only `actorObservation` and public opponent hand/Prize counts. It temporarily hides M4 from native speculative `canPlay` when opponent hand is zero, restores the prototype in `finally`, and fails closed if a chooser still returns a paper-vetoed M4.
- **Store correction** routes the selected physical root through `dispatchSpecialRedCardPaperRoot`. For the exact M4 printing, the reversible hook rejects empty-hand play and, when the opponent has at most three Prizes, uniformly permutes the opponent's actual hand before Twinleaf moves it to deck bottom. Its random stream is selected for the affected hand owner and consumed only by the real Store dispatch, not speculative clones.

## Exact research-owned code and test closure

- `simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs`
- `simulation/evaluation/agent44-m4-public-prerequisite.cjs`
- `simulation/twinleaf/agent44-m4-owner-root-preselection.cjs`
- Existing integration seam: `simulation/twinleaf/headless.cjs`
- `tests/agent44-m4-public-prerequisite.test.cjs`
- `tests/agent44-specialredcard-emptyhand-native.sft.cjs`
- `tests/agent44-m4-owner-root-preselection.native.test.cjs`

Include the exact hashes of all these files, the policy entrypoint, and the source-deck manifest in the new registration's immutable closure. Do not modify the pinned upstream submodule.

## Existing validation and its boundary

- Manual M4 hook/preselection CI [42330894185](https://github.com/FlareZ123/experiment-01/actions/runs/42330894185): dedicated M4 step passed 37/37 native and paper tests plus a no-M4 full-headless control. The overall legacy smoke workflow was red only on its separate known Canceling Cologne step; do not call the whole workflow green.
- Original-source four-arm rank5/rank26 census [42331983284](https://github.com/FlareZ123/experiment-01/actions/runs/42331983284): 39/39 shared smoke checks passed. Both flags were already enabled in these exploratory requests, with unchanged original rank5/rank26 60s, both physical source seats, and rank1 opponent control.
- That four-arm census returned four attempts, zero errors, one native terminal, three 110-root caps. The sole M4-held source arm had 11 owner roots, all 11 correctly failed the **opponent Prize-count >3** prerequisite. There were **zero hand-zero veto opportunities and zero M4 plays**, and all four deals gave the M4 source first player. Thus it validates the real-dealt public Prize-veto exposure and integration path, not the zero-hand branch in a natural game, seat-balanced performance, or a matchup.

The full audit is `results/rules/agent44-m4-headless-integration-audit-20261107.md`; source census and limitations are `results/rules/agent44-original-m4-source-owner-root-four-arm-20261107.md`. The isolated staged two-seat paper correction and shuffled-bottom identity checks are in `results/rules/agent44-special-red-card-empty-hand-official-faq-pinned-source-audit-20261107.md`.

## Next release gate

Create a **new, prospectively frozen common-policy registration**, rather than altering v8 or relabeling its receipts. Register original rank5 and rank26 source 60s, both physical seats, balanced first-player assignments, and no-M4 controls. Retain all source-dealt opportunities and classify: no M4 held, Prize veto, hand-zero veto, legal positive-hand offer, selected/declined, actual payment, actual opponent-hand permutation, deck-bottom identity/order, three-card draw, opponent's next decision, and source continuation. Include fresh deals with an actual M4 owner root at <=3 opposing Prizes and with both zero and positive opposing hand counts; the four-arm pilot did not produce these. Preserve every rejection, error, cap and terminal.

Require independent paper replay of the M4 action and full-match/official-clock admission before any competitive matchup statistic. The two flags and isolated tests are necessary fidelity components, not proof of a winning line.

There is no known pending M4-specific CI run as of this handoff; runs 42330894185 and 42331983284 are completed. I will review the shared integration or Agent16's count-based v2 reserve helper when the steward requests it.

**Current benchmark status unchanged:** 29/32 authenticated originals, ranks 23/25/28 missing, zero competitively qualified games, no selected final 60, no demonstrated 99.5%.
