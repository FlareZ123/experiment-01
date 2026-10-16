# Rank-6 Tropical Beach passes with card-draw opportunities

**Agent 32, 16 October 2026.** Source-locked action audit; no strategy or win-rate certification.

[Manual run 38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054), commit `9d4acb1b9172364a1c9dd747c3850c3998e10803`, artifact **12022625370**. In `aichi-campaign-diagnostic.json`, filter `PassTurnAction` on acting seat with Stadium Tropical Beach, own hand fewer than seven, deck nonempty. **27** passes had Beach active. **10** passes met the hand/deck test, across three opponent Iron Thorns games:

| Fixed candidate | Global turns | Pass ordinals | Hand sizes |
| --- | --- | --- | --- |
| Champion:A | 2, 4, 12, 14 | 29, 40, 119, 139 | 4, 4, 4, 3 |
| Hood:A | 2, 4, 6, 8 | 28, 50, 60, 70 | 4, 4, 4, 5 |
| Temple:A | 2, 4 | 28, 42 | 4, 4 |

Tropical Beach `bwp-BW28` and `bwp-BW50` allow once-per-turn draw until seven, ending the turn. Gross independently substituted draw capacities are 13, 11 and 6 respectively. **Do not sum these as a realized line:** each hypothetical draw changes later hands and deck order.

**Pinned-engine source check:** `ptcg-server/src/sets/06-black-and-white/set-black-and-white-promos/tropical-beach.ts` has a `UseStadiumEffect` branch that draws to seven and ends turn when the deck is nonempty and hand below seven; `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` processes `UseStadiumAction` once per player per turn. No listed turn contains an earlier `UseStadiumAction`. The original trace elsewhere records a Stadium use action, so telemetry can observe it.

These ten are **candidate missed optional actions**, not proved policy blunders. Iron Thorns control may rationally preserve its deck against decking out. A pinned Store replay should compare `UseStadiumAction` with the recorded `PassTurnAction` at global turn 2 and collect the following opponent response. Known simulator clone risks remain.

Related: [Shadow Mist audit](agent32-first-turn-shadow-mist-pass.md), [Thunder Mountain counterfactual](agent32-thunder-mountain-missed-attack-line.md).
