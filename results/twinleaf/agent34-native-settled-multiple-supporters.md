# Pinned Twinleaf resolves two ordinary Supporters on one actual turn

**Agent 34, 20 October 2026 UTC.** Evidence class: **compiled pinned Store behavior in one already selected, authentic source-dealt diagnostic game**, independently archived and inspected at printed-card/log/quota boundaries. This is a confirmed paper-rule fidelity defect, **not a qualified competitive match, a deck-strength observation or a representative prevalence estimate**.

## Paper rule and pinned source cause

The provided Advanced Player's Rulebook v3.4 section B-03 (Supporters) states that a player may use **one Supporter during their turn**. No printed card exception authorizing a second ordinary Supporter is present in the demonstrated line.

Pinned engine: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, submodule `vendor/twinleaf`.

- [`state/rules.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/rules.ts) sets `supporterCleanupAtEndTurn = false`.
- [`reducers/play-card-reducer.ts` lines 108–118](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/play-card-reducer.ts) checks `player.supporter.cards.length > 0` when playing a Supporter, while **omitting the already tracked `player.supporterTurn` counter**.
- [`effect-reducers/play-trainer-effect.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts) can clean a Supporter into discard before end of turn and then increments `player.supporterTurn`. Once the play zone empties, the second Supporter can pass the previous occupancy-only gate.
- [`game-phase-effect.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts) resets `supporterTurn=0` at the end of the owner's turn.

These locations explain an execution observed below. The conclusion does not depend solely on interpreting a `dispatch` return as acceptance.

## Actually settled card and quota transitions

Source fixture `simulation/twinleaf/rank24-k1-search-regression.cjs`, seed **2966203069**, actual rank-24 Iron Thorns source seat **B (1)**, global turns 2 and 14. Both candidate and published opponent 60s, test seed, and decision policy are unchanged from the original K0/K1 diagnostic. `Store.prototype.dispatch` is wrapped reversibly and observed without changing any selected action.

| Global turn | Native root | Printed Supporter | Owner quota before → after | Play zone before → after | Exact card left owner's hand | Matched printed Supporter log |
| --- | ---: | --- | --- | --- | --- | --- |
| 2 | 22 | Cynthia & Caitlin CEC | 0 → 1 | 0 → 1 | Yes | Yes |
| **2** | **24** | **Sidney FST 241** | **1 → 2** | **0 → 1** | **Yes** | **Yes** |
| 14 | 101 | Gladion CIN | 0 → 1 | 0 → 1 | Yes | Yes |
| **14** | **104** | **Sidney FST 241** | **1 → 2** | **0 → 1** | **Yes** | **Yes** |

The second Supporter on each turn is confirmed independently by (a) the same actor ID and unchanged global turn, (b) the exact source object absent from the hand afterward, (c) `supporterTurn` increasing from 1 to 2, and (d) newly written `LOG_PLAYER_PLAYS_SUPPORTER` with the appropriate printed card name and actor. The just-played card was in the player's Supporter/play zone after each action; the earlier Supporter had already left it before the second action. There were **nine** fully settled Supporter root actions audited and **two** confirmed same-turn second Supporters. There were zero unsettled actions under these restricted postconditions.

**Compiled confirmation:** existing manually dispatched [GitHub Actions 39401726848](https://github.com/FlareZ123/experiment-01/actions/runs/39401726848), head `a2bef072effec6a1d7caa7495dbb5eb1fb559572`, result success. Artifact [12254889821](https://github.com/FlareZ123/experiment-01/actions/runs/39401726848/artifacts/12254889821) contains all three preserved source-deal control cases with unchanged policy and the now strengthened native postconditions. Downloaded archive SHA-256 `2c8022867d3ebb931a2ee841ca9a12992a3b94b3e3097dbfecd9dd33b1b7fb8a`; `rank24-k1-search-regression.json` SHA-256 `bc9ef41c5e61bee9d707781eb6dff0b5b6084a26ff5d6aaad3ec60a7045ec9a3`.

## Reproducible research-owned regression

- `simulation/twinleaf/native-supporter-turn-audit.cjs`: augmented existing read-only observer to preserve the original owner's printed card object, hand departure, zone, before/after turn and Supporter quota, and optional matching new printed log. `repeatPlays` now contains **only** confirmed settled root actions with `supporterTurnBefore>=1`; separate `unsettledPlays` preserve unverified attempts.
- `tests/native-supporter-turn-audit.test.cjs`: six tests; fake-Store adversarial negatives include a returned nonaction, removed hand card without quota, missing Supporter log, rejected Store action, and separate turns.
- `simulation/twinleaf/rank24-k1-search-regression.cjs`: original exact source test now supplies the pinned `GameLog.LOG_PLAYER_PLAYS_SUPPORTER` code and asserts the second Sidney's genuine card/log/quota settlement without editing native decisions.
- All six unit regressions and the same three-source-deal native compiled test passed in the existing manually dispatched workflow. The usual different source branches were retained.

## Impact and next gate

The current engine and unmodified bot can produce playable-looking transcripts that **violate the paper Supporter rule**, even when a root dispatch succeeds and the resulting game continues. Such affected complete-game outcomes must carry a paper-fidelity veto; they cannot be counted as competitive wins. Do not retroactively assume every historical game was affected or assign a rate from this selected fixture.

Implement a reversible research-owned **one-Supporter-per-turn legality gate** at the common live Store/player-policy boundary; it must honor genuine explicit card-rule exceptions if found and should not silently convert an attempted illegal Supporter into a winning action. Pair this with an owner-visible decision policy that avoids requesting another Supporter after quota exhaustion. Validate one native first-Supporter positive control and an exact second-Supporter negative control, then rerun the canonical rank6/rank11 four arms **without modifying their frozen candidate 60s or retroactively upgrading them to win samples**.

Do not patch `vendor/twinleaf` directly. New common-policy versions must record hook identity and both-seat application. No official 25-minute clock calibration, competent policy or full Top32 performance follows from this finding. Field remains **29/32 exact source lists, zero competitively qualified games**, and 99.5% is unproven.
