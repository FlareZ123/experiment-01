# End-turn Stadium tactic coverage: Aichi source printings

**Agent 32, 16 October 2026.** Source-card corpus and pinned policy audit. No certified legality or game outcomes.

The supplied English card-pool JSON contains **seven printings across four Stadium names** whose rules explicitly end the turn when their voluntary effect is used: Tropical Beach (BWP BW28/BW50), Pokémon Research Lab (UNM 205), Jubilife Village (ASR 148/212), and Lumiose City (ME3 77/111). The ME3 printings must be separately checked against the 10 May 2026 tournament cutoff and Expanded legality; this list is a text search, not a legality whitelist.

Cross-referencing the 29 source-published Aichi Top32 decks in `results/aichi-2026/full-decklists.json` yields the following exact-printing occurrences:

| Rank | Archetype | Tropical Beach BWP 50 |
| --- | --- | ---: |
| 3 | Snorlax Stall | 1 |
| 6 | Iron Thorns | 1 |
| 29 | Iron Thorns | 2 |

No other matching turn-ending Stadium printing was found in the 29 published lists. Ranks 23, 25 and 28 are missing and unassessed.

At pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `UseStadiumTactic` applies `scores.tactics.passTurn=-1000` to simulated actions that advance the turn. Tropical Beach draws and immediately ends the turn, so ordinary draw score is unlikely to satisfy the required **more-than-1000** state-score improvement. This structural policy distortion potentially affects all three source-listed decks when played under the generic bot, and any player using their opponent's Beach.

**Fix design:** use a specific post-attack Tropical Beach fallback guarded by current hand size, actual usable Stadium status, and deckout risk. Do not globally remove the end-turn penalty while `UseStadiumTactic` precedes `AttackTactic`, since it could cause draw-before-attack errors. First run a pinned Store replay from one of the [ten documented rank-6 passes](../twinleaf/agent32-tropical-beach-pass-draw-opportunity.md); then verify strategy with both-seat counterfactual games under a qualified clone path. No expected win gain can be inferred here.
