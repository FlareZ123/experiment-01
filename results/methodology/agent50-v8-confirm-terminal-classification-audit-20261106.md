# Audit: v8 default-Confirm native terminal classification

**Agent50 | 6 November 2026 | methodological audit, raw terminal fields pending verification**

## Question

Why did the same-eight v8 plus Telepath plus default-Confirm-false native test fail, and does its 110-entry treatment arm represent a genuine native terminal?

## CI evidence

Failed workflow run [42262243840](https://github.com/FlareZ123/experiment-01/actions/runs/42262243840), head `e2fb21fb4136d692de1b91bf361fa903797e9f05`, emitted:

- 8 control attempts and 8 treatment attempts.
- Same registration, same initial source deals, same initial full physical deals, and exact prior root prefix across all eight arms.
- Confirm audit: 11 offers, 11 submissions, 11 native acceptances, 0 rejects, 0 unsettled. This comprises 8 `GO_FIRST` and 3 `WANT_TO_USE_ABILITY` answers, all false.
- Seven treatment arms have 128 ledger entries.
- The remaining arm, `1:212:B:champion-reference`, has 110 entries. Its Confirm audit records `GO_FIRST` and a turn-22 `WANT_TO_USE_ABILITY` prompt. The control arm for this ID aborted with an engine error at zero roots; the treatment returned normally with 110 entries.
- The test fails only at `allTreatmentRoots128`.

The Confirm handler's prompt settlement, deal parity, and root-prefix assertions all pass. The failing assertion assumes every arm must have exactly 128 ledger entries.

## Source audit

The current v8 summary at `simulation/evaluation/agent36-issue25-common-v8.cjs:98-100` uses `status: row.status ?? 'returned-unqualified'` and retains only `acceptedNativeRootCount`. It omits `finished`, `winner`, `endReason`, `actionCount`, `finalPrizes`, and `finalBoard`. The fallback therefore cannot distinguish a native terminal from a nonterminal return.

The raw development row does contain those fields at `simulation/evaluation/agent41-bilateral-v2-development.cjs:1155-1167`. The selected-v0 summary already demonstrates the needed distinction at `simulation/evaluation/agent36-issue25-selected-v0.cjs:208-209`, where a finished row is classified as `native-terminal-unqualified`.

Pinned headless behavior:

- `simulation/twinleaf/headless.cjs:962-964` defines `maxActions` as the fail-safe bound on all user/bot actions.
- Line 1077 loops while phase is not `FINISHED` and `actions < maxActions`.
- Lines 1822-1844 append one ledger entry after each successful Store dispatch and increment `actions) once.
- Lines 1847-1855 return `finished` and `endReason` from the final phase and action count.

There are no early loop breaks or continues between loop entry and the return. Therefore, if the raw row's ledger length and action count are both 110 while the configured `maxActions` is 128, the loop should have ended because the phase became `FINISHED`. That is a strong source-level inference of a native terminal, pending direct confirmation from the raw row's `finished` and `endReason` fields. Do not infer the winner or result from the current summary.

## Required correction

Before changing the test's gate, expose these raw fields for every arm:

- `actionCount`, `finished`, `winner`, `endReason`
- `finalPrizes`, `finalBoard`
- `rootActionCount` and its relationship to `actionCount`

Then classify each treatment arm as either a native terminal or a nonterminal action-cap return. If the 110-entry arm is finished, preserve it as a development-only native terminal and replace the all-128 assertion with a terminal-or-cap condition. If it is not finished, investigate the discrepancy between the loop counter and ledger.

The registration's `maxNativeRootActionsPerArm:128` currently reaches `runMatch` as `maxActions:128`. These are only equivalent if every action iteration creates one root-ledger entry and the match remains nonterminal. A future true root cap should be separated from the all-actions fail-safe cap.

## Limits

Even if confirmed, this would be a native engine terminal under a development policy. The policy is not qualified for paper hidden-information safety, the official tournament clock, or full competitive play. The run records **zero competitive-qualified games** and provides no matchup win-rate evidence.
