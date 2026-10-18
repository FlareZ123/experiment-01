# Agent 25: source rank9 full-root-ledger noninterference audit

**18 October 2026.** Evidence type: bounded, retrospective original-Store observer integrity probe. It cannot establish source replay, independent full attack-effect fidelity, opponent competence or any competitive win rate.

## Question and suspected measurement defect

The shared full-root Store ledger introduced by Agent 17 is captured only when `captureDecisionTrace:true`. The prior source noninterference test `simulation/twinleaf/trace-noninterference.cjs` compared traced and untraced results after omitting only the selective `decisionTrace`. After the newly added `rootActionLedger` and `rootActionLedgerProtocol`, that comparison requires excluding these **additional read-only evidence fields**, while continuing to compare all of the remaining unqualified gameplay results.

The narrow correction in that existing file also asserts that the captured root-ledger row count equals every successful source Store dispatch. No game rules, decision policies, cards, seed schedules or original source lists are changed.

## Actual source test

[Versioned runner](../../simulation/twinleaf/rank9-root-ledger-noninterference.cjs) calls the pinned `runMatch` twice, changing **only** `captureDecisionTrace`:

- Published rank-1 Yasunori Kato Shadow Rider physical A; exact published rank-9 Shun Ito Absol Electrode physical B, 60 cards each;
- Original source seed `387039398`, 180 Store-action cap. This retrospectively known seed already produced a real native `Horror House-GX` declaration at root ordinal 21 in [Agent 10's source exposure study](../aichi-2026/rank9-horror-house-root-source-exposure.md);
- `strictPromptValidation`, `forestSealSearchCorrection`, `supporterDecisionCorrection`, `leleEntryAbilityLockCorrection`, `entryDrawLockCorrection`, `isolatePolicyRandomness` and `pendingEndTurnSwitchCleanupCorrection` are fixed on both arms;
- Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The test checks identical draw-log first-turn verification, seed, source deck hashes, Store action totals and counters, attack declarations, turn clocks, final public card/Prize state, terminal state, winner and other result fields. It separately requires an exhaustive, ordinal-contiguous root ledger, logged native attack linked to its exact actual root, and ordinary omitted observer fields when capture is off.

A digest or root-action declaration remains **internal consistency evidence**. It does not demonstrate copied `Perfection` attack resolution or full paper timing. The seed was selected earlier for an attack-exposure diagnostic and must never become a new independent matchup-trial denominator.

## Reproduction status

The existing manual-only [Aichi trace noninterference workflow](../../.github/workflows/aichi-trace-noninterference.yml) now runs the original rank1/rank6 parity and the new rank9 source case after compiling the gitlink. Workflow [39146194455](https://github.com/FlareZ123/experiment-01/actions/runs/39146194455) was dispatched at head `1c22776074956319869db76652fb5c8605f88cef`. **Compilation and assertions are pending at initial report publication; this paragraph is not a passing CI claim.**

Field status: 29 of 32 exact opposing registrations, ranks 23/25/28 missing; qualified competitive games 0; no demonstrated 99.5% fixed-deck win rate.
