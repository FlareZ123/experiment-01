# Agent 37: pinned native Stadium enumerator suppresses a paper-legal own-Stadium replacement

**4 November 2026 | exact-source original Aichi rank 5 versus rank 11 | bounded, noncompetitive engine validation**

## Finding

The pinned Twinleaf `ActionEnumerator.playStadiumActions` drops **every held Stadium** when the actor owns the current Stadium, even when the actor has not played a Stadium this turn and the held Stadium has a **different printed name**. This is a systemic **false negative in native action generation**. The pinned native Store's actual Stadium-play reducer permits such a replacement, consistent with the supplied *Advanced Player's Rulebook*, B-04, which allows one Stadium per turn and replacement of a differently named Stadium.

No vendor submodule code was changed. This result does not certify decision policy quality, opponent competence, a winning counterfactual, or an Aichi game win rate.

## Exact source and provenance

- Actual pinned Twinleaf Git revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at the existing `vendor/twinleaf` submodule.
- Pinned source code: `ptcg-server/src/advanced-bot/action-enumerator.ts`, `playStadiumActions` returns immediately if `player.stadium.cards.length > 0`. The same source filters the currently active Stadium by `fullName` after that check. In `ptcg-server/src/game/store/reducers/play-card-reducer.ts`, the Stadium path checks `stadium.name===handCard.name` and same-turn play, without forbidding the player to replace their own differently named Stadium. `ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts` discards an existing Stadium before placing the new one.
- [GitHub Actions run 41745533909](https://github.com/FlareZ123/experiment-01/actions/runs/41745533909) completed successfully, exact run head SHA `c22f92ed8071eefea800f80b19bd2b832d08c384`.
- Native regression: `tests/agent37-own-stadium-enumerator.native.test.cjs`. Both physical seats, own-Stadium omitted by ActionEnumerator but accepted by actual Store; opponent-owned replacement offered and accepted as control. Four passing staged native scenarios. These are **not games**.
- Original-source A/B/A read-only telemetry: `simulation/twinleaf/agent5-generic-owner-trainer-frontier-native.cjs` with `AGENT7_STADIUM_PUBLIC_SNAPSHOT=true`; existing control/observed/control runner and actual source ranks **5** (Mew/Genesect) versus **11** (Absol/Garbodor), both physical seats. Audit helper `scripts/agent37-source5-skyfield-stadium-audit.cjs`.
- Raw original-source snapshot: workflow artifact `agent37-original-source5-stadium-owner-context`, artifact ID **13283182331**, raw uncompressed JSON SHA-256 `f312623db5d6406c0248233f8f287a45445e04ad296e65b6b6688ed5207e522f`; original seed 912174767 for rank 5 in seat 0, 1914651848 for rank 5 in seat 1.
- Both source-seat A/B/A groups have matching control, observed, repeated-control game-trace SHA-256 values and identical opening physical-deal SHA-256 values. Observation did not change the original game or action sequence.

### Four owner-authenticated omissions

All four rows are the **same held physical Sky Field ROS copy repeatedly observed** in rank 5's hand, rather than four independent games. The opponent-source original was rank 11 in all four.

| Rank 5 seat | Original seed | Root ordinal | Native global turn | Current Stadium and owner | Last actor Stadium play | Paper generic blocker | Native enumerator Sky Field offered? | Selected native action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 912174767 | 14 | 7 | Path to the Peak CRE, rank 5's own | 5 | None | No | Pass |
| 0 | 912174767 | 17 | 9 | Path to the Peak CRE, rank 5's own | 5 | None | No | Pass |
| 0 | 912174767 | 19 | 11 | Path to the Peak CRE, rank 5's own | 5 | None | No | Pass |
| 0 | 912174767 | 21 | 13 | Path to the Peak CRE, rank 5's own | 5 | None | No | Pass |

At each root: owner `stadiumPlayLocked=false`, opponent Stadium zone empty, rank 5 owns one `Path to the Peak CRE`, has `Sky Field ROS` physically in hand, and `stadiumPlayedTurn=5`. The held Sky Field's name differs from the Stadium in play. The native enumerator's `player.stadium.cards.length>0` clause is sufficient to explain every omission without invoking a cap or a special card rule.

The original recorded controller passed each time. The replay did not force an alternative owner-card play, so it cannot show whether playing Sky Field would be tactically correct, how much it would change the board, or whether any game outcome would differ. Counting four repeated roots as four independent trials would inflate a denominator.

## Scope beyond a single source

The 29 authenticated original Aichi 60s in `results/aichi-2026/full-decklists.json` all contain at least one Stadium, and **18 of 29** contain at least two differently named Stadium cards (ranks 1, 2, 3, 5, 6, 7, 9, 11, 12, 13, 15, 20, 21, 24, 27, 29, 31, 32). These names were checked against the supplied English card collection, including the Prism Star Stadium variants. This is an inventory-only scope finding. It does **not** establish that the buggy branch executed or adversely affected those other sources.

## Integration consequences

1. The shared owner-root legal-action candidate generator should independently consider held differently named Stadiums even when the acting player's Stadium zone is occupied, subject to actual same-turn, same-name, lock, and special-print conditions. Do not rely on the native enumerator's presence **or absence** as a paper legality certificate.
2. Certify an actual playable root only after the specific printed card, target and real physical Store dispatch settle. Keep theoretical availability separate from strategic benefit, opportunity cost, and final outcome.
3. Test any generic fix against both player seats and exact original decks with matched physical deals. Compare the best alternative to the selected Pass and to any other resource-consuming action. A one-card Sky Field heuristic alone would be a narrow patch rather than proof of generally competent play.
4. Do not count these observations as competitively qualified games or claim any 99.5% field win rate.

**Global benchmark status at this result:** 29 verified original field lists, ranks 23/25/28 still missing, zero competitively qualified games, no selected fixed winning sixty.
