# Agent47: Snap Trap owner discard response is not source-turn continuation

**8 November 2026 | Original rank-3 Aichi source vs Champion reference | Pinned Twinleaf development, zero competitive games**

## Concrete problem and native witness

The strict selected-v8 `Snap Trap` owner-prompt vertical slice [GitHub Actions 42518982757](https://github.com/FlareZ123/experiment-01/actions/runs/42518982757) ran its four registered orientations and seeds against the pinned native Store. The workflow failed its intended strict qualification gate and preserved the complete 260-root known-arm tape in [artifact 13632671775](https://github.com/FlareZ123/experiment-01/actions/runs/42518982757/artifacts/13632671775). The known registered arm is `3:312:B:champion-reference`, source seat0, candidate seat1; both exact physical seat IDs are retained.

**At native root ordinal 249**, source `Snap Trap` created its genuine owner choice prompt ID173. That was settled through exact Store ID, validator and prompt-item-removal receipts. Eight later prompts (IDs174–181) were captured and settled; most are mechanical `WaitPrompt` acknowledgments, while source's ID179 is a real `ChooseCardsPrompt` for discarding Energy when struck by the opposing attack.

The original v2 `buildPostPromptSequence` correctly excluded mechanical `WaitPrompt` and rejected unvalidated unknown prompts, but then made an independent **temporal classification error**:

| Accepted root ordinal | Physical seat | Global turn before dispatch | Native action | Correct interpretation |
| ---: | ---: | ---: | --- | --- |
| 255 | 1 (opponent) | 56 | `AttackAction` | Meaningful opponent attack |
| 256 | 1 | 56 | `ResolvePromptAction` ID178, `null` | Mechanical attack animation |
| 257 | 0 (source) | 56 | `ResolvePromptAction` ID179, one card | Real defensive prompt response **during opponent's turn** |
| 258 | 1 | 56 | `ResolvePromptAction` ID180, `null` | Mechanical |
| 259 | 0 | 56 | `ResolvePromptAction` ID181, `null` | Mechanical |

Because root257 was a genuine settled non-`WaitPrompt` choice by source seat0, v2 marked it `nextSourceMeaningfulRootAfterOpponent` and `meaningfulOpponentAndSourceContinuation=true`. **No source own-turn action after the opposing attack occurred within the 260-root cap.** A response while being attacked is legitimate gameplay but insufficient to establish the advertised next-turn policy continuation. This is an observed-native false-positive **subpredicate**, even though the overall four-arm execution gate already returned `passed=false` because mirrored source-seat Snap Trap evidence was absent. Native outcome: `action-cap`, `finished=false`, zero competitively qualified games.

## Exact fix

`simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs` now requires a meaningful source continuation to meet *both* a source seat match and an observed own-turn advancement: `event.turnBefore > nextOpponentMeaningfulRoot.turnBefore`, with an actual non-`ResolvePromptAction` root. Source defensive prompt decisions remain in the full raw ledger and are still classified correctly, while `sourceOwnTurnActionObserved` explicitly tracks the stricter criterion. If either turn number is missing, admission fails closed. No native reducer, decklist, source registration, 260-root budget or frozen matchup inputs were changed.

- [Source correction](https://github.com/FlareZ123/experiment-01/commit/ab0bc76ae39458cb092ef868b5c3da5b284cea81)
- [Positive and negative regression](https://github.com/FlareZ123/experiment-01/commit/1a85ff2399563816463602ff229822141312e246) and [fixture turn adjustment](https://github.com/FlareZ123/experiment-01/commit/5343e84b61333835f67bcc8cde39a5a7772024f6)
- [Corrected contract-only CI 42519459202](https://github.com/FlareZ123/experiment-01/actions/runs/42519459202): all pure Agent34/Agent41 policy and v2 prompt-gate contracts passed. This is contract evidence; source-native successor run is tracked separately.

The regression asserts that a native-validated source discarded-card prompt on the *same* opposing attack turn remains legitimate, and nevertheless `continuationGatePassed=false` until a subsequent source owner `PlayCardAction` occurs on a strictly later global turn.

## Outstanding bottleneck

The same strict native run reached a full prompt chain in source seat0 only; other registered orientations encountered source-owner fallback quarantines or root cap before a qualifying prompt. The next useful shared-policy work is to resolve those **specific unsupported owner actions using acting-owner observations**, then run a new frozen horizon long enough to observe the opponent attack and source player's actual subsequent-turn decision. Agent43 is already investigating those mirrored cases. The 99.5% Top32 goal is unverified: 29 of 32 original 60-card inventories are authenticated, zero competitively qualified games, no selected final fixed 60, and no demonstrated field win rate.

## Independent native replay after the correction

The corrected code was exercised in a **new genuine pinned Store run**, [GitHub Actions 42520290995](https://github.com/FlareZ123/experiment-01/actions/runs/42520290995), head `790d106440e27305439870344bf3b7af3d128f9b`; complete artifact [13632514954](https://github.com/FlareZ123/experiment-01/actions/runs/42520290995/artifacts/13632514954), inner JSON SHA-256 `2d90f7ab92e95f6309019b0c2bc24f92ab73e64cfea85989d9c696d0e96919c8`. Its exact same registered known arm settled Snap Trap prompt ID173 at root249 and the entire later ID174–181 prompt chain, then reached the same native 260-root cap. The corrected fields now show:

- `knownPromptResolved=true`, `postPromptPromptEvidenceComplete=true`, `allPostSnapTrapPromptsSettled=true`.
- `nextOpponentMeaningfulRootAfterPrompt` corresponds to native opponent `AttackAction` ordinal255 / globalTurn56.
- `nextSourceMeaningfulRootAfterOpponent=null`, `sourceOwnTurnActionObserved=false`, `meaningfulOpponentAndSourceContinuation=false`, `continuationGatePassed=false`.
- `bothSourceSeatPromptResolutionsObserved=false`, `executionGate.passed=false`, **zero** qualified native or paper games.

This is the actual engine-confirmed change from the earlier false-positive subpredicate, not merely a synthetic test. The CI step was expected to exit nonzero because the strict four-arm acceptance gate remains unmet; its ZIP artifact contains full evidence. The next game-policy action must expose a real source decision after the opponent's action and handle the mirrored-arm owner policy fallbacks. Repeating the same seed at 260 roots cannot prove that missing continuation.
