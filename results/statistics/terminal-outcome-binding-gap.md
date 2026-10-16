# Terminal outcome binding gap in the 64-cell confirmatory e-process

**Agent 8, 16 October 2026.** Evidence: source-code audit and deterministic arithmetic, **not** real games. No qualified competitive results.

## Exact gap

The deployed `scripts/aichi-anytime-field-evidence.cjs` verifies that each field cell has a valid reported `outcome`, that the claimed actual starting seat is compatible with the first-turn metadata, and that game identifiers, seed values and deck/policy/engine identifiers are consistent and unique. It **does not require** the raw game result's `finished` or `winnerIndex` fields. Thus a loss for candidate physical slot A (engine `winnerIndex: 1`) could appear as `outcome: "win"` with otherwise identical recorded fields; the checker cannot detect the discrepancy.

The upstream `simulation/evaluation/aichi-campaign-execute.cjs` already exposes `candidateEngineSlot`, `winnerIndex`, `endReason`, source-deck digest and first-turn metadata in raw diagnostic records. These are appropriate fields for an internal consistency gate. The runner still labels such records `completed-engine-game`, correctly insufficient for competitive certification.

## Threshold sensitivity

Under the predeclared `q=0.995`, 64-cell/round e-process, ten complete rounds contain 640 observations. Its existing tested mixture returns:

| Reported result | e-value | Threshold 20 |
| --- | ---: | --- |
| 640 wins / 640 games | 24.13948111112 | Crosses |
| 639 wins / 640 games | 0.05725249664 | Does not cross |

These values are deterministic formula results, recomputed separately. If a single genuine engine loss were mistranscribed as a win in this boundary example, the current checker would let the result cross its mathematical threshold. This illustrates **record-label integrity**, without asserting that any real Aichi game was misclassified.

## Proposed fail-closed correction

For each putatively qualified row require `finished === true`, `winnerIndex` exactly one of 0, 1 or 3, and `candidateEngineSlot` exactly A or B. Derive the expected `outcome`: winner 3 means draw; otherwise candidate A means winner 0 is win, candidate B means winner 1 is win. Opposite-seat winners mean loss. Reject any discrepancy before counting a round. Test missing result, unfinished result, inverted label, legitimate draw, and both physical candidate slots. Continue treating the whole record as *unqualified* until paper rules, terminal cause, full source replay, policy fairness and provenance have been independently reviewed.

A trial implementation of this condition was committed temporarily, then reverted when updates to the existing test file were blocked. The deployed checker was restored to its original file SHA `f2da2a2dff303929b7afd35b4aab24949909b8c1`, leaving no untested change in the calculation path. The required test update and independent qualification audit remain open.

## Scope

This proposed check would stop contradictory self-reports. It cannot authenticate `winnerIndex` or detect an intentionally fabricated terminal record; only a verified source Store/event replay with trusted raw capture can establish that. The evidence remains **zero qualified competitive games**, and no 99.5% win-rate claim follows.

## Optional strict intake implementation

A new opt-in [terminal-bound wrapper](../../scripts/aichi-qualified-outcome-binding.cjs) and [adversarial fixture suite](../../tests/aichi-qualified-outcome-binding.test.cjs) now enforce the derived win/loss/draw parity before delegating to the unchanged original e-process. A [manual-only test workflow](../../.github/workflows/aichi-terminal-outcome-binding.yml) is committed. These artifacts were not tested in remotely compiled CI during this invocation because workflow trigger access was blocked. The original core function remains unchanged and callers must explicitly select `assessTerminalBoundFieldEvidence` to obtain the additional guard. The wrapper checks consistency of untrusted self-reports, with **no authenticated competitive games**.
