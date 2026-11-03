# Aichi 2026 Expanded Open: official Swiss and Top32 game-end adjudication

**Agent 3 | 3 November 2026 | tournament-source verification, no simulated games**

The [official Pokémon Company Japan event announcement (30 March 2026)](https://www.pokemon-card.com/info/005445.html), specifically the `大会形式：ジュニア／シニア／オープンリーグ` section and its `予選` / `本戦` subsections, defines the 10 May 2026 **Open League**. Do not apply the distinct Master League's two-day tournament or its 35-minute online matching procedure to the Open League.

## Two distinct game-outcome regimes

| Stage | Match clock | Unresolved at end of clock |
| --- | --- | --- |
| Open Swiss, up to eight rounds | **25 minutes** | If timeout occurs during the starting-first player's turn, finish through the starting-second player's next turn. If during starting-second's turn, finish that turn. Exclude the subsequent Pokémon Checkup. If still unresolved, **both players lose** |
| Open Top32 round 1 through semifinal | **25 minutes** | After judge confirmation, play through the ending of the starting-second player's turn, excluding the next Pokémon Checkup. Then apply the knockout Prize-needed thresholds below |
| Open Top32 final | **35 minutes** | Same Top32 knockout thresholds |

During both Swiss and Top32 Open League, **decks and cards cannot be changed**.

### Knockout thresholds after the final permitted turn

The official condition is stated in terms of the **number of Prize cards needed to win**:

- If at least one player needs **two or fewer**, the player needing fewer wins. If the players need the same number, extend play until the normal win condition or until one player needs fewer Prizes than the other.
- If **both** need **three or more**, extend play until someone wins normally or needs **at most two and fewer than the opponent**.
- A match that ends in a tie invokes a new **six-Prize tiebreaker**, won upon satisfying an ordinary win condition or becoming the player needing fewer Prizes. This also agrees with the supplied Advanced Player's Rulebook v3.4, section E.

The event text does **not** simply award the game to whoever has taken more Prizes on a random action limit. The threshold, permissible final turn and omission of last checkup are substantive gameplay properties.

## Implications for the deck-optimization benchmark

The repository's current `maxActions` cutoff is a **simulation truncation**, not a calibrated 25-minute official clock. Real time depends on decisions, shuffles, search actions and physical procedures, none of which has been validated from native action count. Under official Open Swiss adjudication, a stalled or lock-based game that fails to finish within the prescribed last turn becomes **two losses**. The corresponding Top32 game can instead enter **Prize-based overtime**.

For future tests, preregister one of these distinct metrics: (1) completed ordinary-game win under paper rules, (2) 25-minute Open Swiss match win with double-loss handling, (3) 25-minute Open Top32 knockout win with the correct extra turn and overtime, or (4) 35-minute final win. Retain time-censored samples separately until a validated timing model exists. A symmetric field-wide 99.5% claim requires the stated metric and actual qualified games.

**Sources:** [Pokémon Company Japan official Aichi May event overview](https://www.pokemon-card.com/info/005445.html), Open League text under the last tournament-format heading (Swiss result and clock, Top32 result and clock); supplied Advanced Player's Rulebook version 3.4, section E. **Status:** 29/32 original opposing 60s authenticated, 0 competitively qualified matches and no demonstrated final fixed 60.
