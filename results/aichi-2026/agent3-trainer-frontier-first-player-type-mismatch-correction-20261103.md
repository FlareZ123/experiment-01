# Agent 3: fix false first-player flag in the original rank5/rank11 A/B/A Trainer frontier

**3 November 2026 | pinned native archive audit and one-line owner-seat report correction | zero qualified games.**

## Exact source defect

The original [Agent29 native A/B/A runner](../../simulation/twinleaf/agent29-bilateral-trainer-frontier-parity-native.cjs) used:

```js
originalRank5SourceStartedFirst:control.result.firstTurnSlot===physicalSlot,
```

This compared the **number** 0 or 1 from headless `summarizeTurnOrder(...).firstTurnSlot` with the **string** `'A'` or `'B'` from the registration's `physicalSlots`. Strict equality is false for every possible native starting seat, even when original rank5 actually started first. The correct same-game comparison is to `source5Seat` (0 or 1), which is the rank5 source's physical seat in the same run:

```js
originalRank5SourceStartedFirst:control.result.firstTurnSlot===source5Seat,
```

**Committed and remotely verified** as [Agent3 commit `f28a8a3`](https://github.com/FlareZ123/experiment-01/commit/f28a8a39917f805334a0a4a0155616a7bc921d8c). No policy, native options, deck definitions, source seeds, action roots or native decision logic changed. Only a generated informational first-player flag changes in new exports.

## Independent immutable archived contradiction

Downloaded the [original successful pinned CI 41622702316 artifact 13223897958](https://github.com/FlareZ123/experiment-01/actions/runs/41622702316/artifacts/13223897958) and independently decoded `agent29-generic-trainer-native-parity.json`, ZIP SHA256 `7639116428e7b9ee231d34e1f99d6f82a4bec380aabde9a9eae19635c40c4ceb`.

The native observer's first true owner-turn decision can be identified from `observerSummary.examples[]` at `turn===1`, and belongs to the first native player according to [the source of `turn-order-evidence.cjs`](../../simulation/twinleaf/turn-order-evidence.cjs). The original printed rank5 source's seat is separately recorded as `source5Seat`. The two physical case records yield:

| Physical deal | Original rank5 seat | Native first owner root seat | Correct rank5 first? | Archived `originalRank5SourceStartedFirst` |
| --- | --- | --- | --- | --- |
| A | 0 | 0 | **true** | **false** |
| B | 1 | 0 | false | false |

The A row is a **reproducible misreported first-player case**. The B row is true by coincidence; the same defective expression returned false unconditionally. This archive already certifies A/B/A control/observer/repeated-control exact physical setup, root ledger and native result parity. The bug does **not** invalidate those underlying parity claims; it invalidates the archived `originalRank5SourceStartedFirst` labels and any aggregate derived from them.

This audit uses the actual archived first owner-root event as an independent consistency check. The revised runner's new flag has **not** been independently rerun through compiled native CI; new native runs can use the corrected expression, and historical evidence should retain original raw bytes with explicit erratum.

## Research implications

First-player stratification matters for original source decks with first-turn Battle VIP Pass and Supporter/attack restrictions. A false all-second label can silently corrupt any later stratified estimate even when policy A/B/A parity is sound. Reconcile native `firstTurnSlot` against the rank5 physical `source5Seat`, and preferably retain the raw numeric values alongside the derived boolean in future machine artifacts. Never use a human-readable A/B seed slot label as a numeric physical player seat.

The larger decision boundary is unchanged: **29/32** original Top32 printed 60s authenticated, ranks **23,25,28** missing, **zero competitive-qualified games**, no fixed selected 60, no 99.5% proof.
