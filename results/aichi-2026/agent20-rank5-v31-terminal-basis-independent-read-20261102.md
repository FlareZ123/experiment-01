# Agent 20: independent rank-5 source-terminal classification (2 November 2026)

This is a retrospective audit of Agent13's immutable [native run 41387484608](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608), artifact 13115652707, ZIP SHA256 `62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d`. No new games were run. Pin: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The complete artifact's `agent13-rank5-v31-native-16arm.json` exposes `comparisons[].integratedV3.sourceAttackSettlement.attacks[]` and `modes.integratedV3.attempts[].rawNativeRow`; join by `trial.id`. The original rank5 opponent is source physical seat 1 in both winning trials.

| Trial | Source attack turns | Prizes remaining [candidate, source] | Opponent board after final attack | Interpretation |
| --- | --- | --- | --- | --- |
| 5:1:A:champion-reference | 19,23,27 | [6,1] | Active empty, Bench empty | Native win is consistent with all opponent Pokemon gone, **not** a Prize sweep |
| 5:1:A:new-moon-lockbreaker-v1 | 21,25,29,33 | [6,0] | Active empty, Bench five Pokemon | Native win via the source taking all Prizes |

The champion reference source knocked out Dialga-GX for two Prizes on turn19, Latias ex for two on turn23, and Girafarig for one on turn27. Its observed candidate next root after the first two KOs was `PassTurnAction` at turns20 and24, with no observed board replenishment. This identifies an opponent-policy board-exhaustion exposure, while proving no missed legal alternate action.

The New Moon source KO sequence was Latias ex (two Prizes), Galarian Articuno V (two), then two attacks on Gengar & Mimikyu-GX (zero and two). Its intervening candidate reply roots were accepted Unown and Lunatone plays, followed by a pass. A third trial with one source attack (`5:1:B:new-moon-lockbreaker-v1`) ended action-capped at [4,4], never as a source victory.

Both native engine terminals were unqualified for paper legality, decision competence, randomness and tournament time. The supplied Advanced Player's Rulebook section I.E distinguishes no Pokemon remaining from all Prize cards taken. A future release should record `terminalBasis` separately from the coarse native `endReason:engine-game-end`, with preterminal board evidence, and should preserve both outcomes as developmental only.

**Competitive-qualified games: zero. No 99.5% win-rate evidence.**
