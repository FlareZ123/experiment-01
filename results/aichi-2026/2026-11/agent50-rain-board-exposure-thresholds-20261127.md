# Conditional Rain defense thresholds: board placement and prior damage

Static printed-HP examples only, assuming six attacker Prizes, Sight active, no other prevention/modification, and all shown Pokémon in play. Removing two Reversal/Counter/Unit bounds remaining total Energy units of the fixed 4R/4C/4U source family to 18/20/22 respectively when fully active. Actual two-Bomb+manual loading may be smaller; no native game or win claim. Potential Active is a comparison, not a legal retreat or claim of correct overall action. Girafarig's Get Lost ends the turn, so a different Active is only relevant on a separate line or subsequent legal turn.

| Board (first listed Active) | Current terminal hits | Safest potential Active | Highest threshold | Remove 2 Reversal denies | Remove 2 Counter denies | Remove 2 Unit denies |
|---|---:|---|---:|---|---|---|
| two VMAX | 21 | max0 | 21 | true | true | false |
| Girafarig and two VMAX | 20 | max1 | 21 | true | false | false |
| Girafarig, TAG TEAM, Tapu Lele | 16 | trev1 | 17 | false | false | false |
| VMAX, VMAX, Tapu Lele | 21 | max0 | 21 | true | true | false |
| VMAX, VMAX, Tapu Lele, Girafarig | 18 | lele2 | 19 | false | false | false |
| VMAX, two V, Tapu Lele | 17 | v1 | 18 | false | false | false |
| VMAX, Wobbuffet, Tapu Lele, Latias | 20 | max0 | 20 | true | false | false |
| VMAX, TAG TEAM, Tapu Lele | 19 | max0 | 19 | true | false | false |
| two VMAX with 30 damage on second | 20 | max0 | 20 | true | false | false |
| two VMAX with 60 damage on second | 19 | max0 | 19 | true | false | false |
| two VMAX with 90 damage on second | 18 | max0 | 18 | false | false | false |
| two VMAX with 120 damage on second | 17 | max0 | 17 | false | false | false |

Interpretation: do not over-generalize the two-undamaged-VMAX rule. Prior damage and small additional Prize liabilities can reopen a six-Prize route below 18 hits, and the candidate cannot both attack Get Lost and retreat afterward. Evaluate the actual board and opportunity cost. The static exposure solver supplies thresholds; the explicit-envelope defense helper supplies available-energy bounds and physical discard choices. Unknown effects and actual policy execution remain outside this calculation.
