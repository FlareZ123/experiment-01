# Rank-6 printed Team Flare Grunt: Basic-valid opening access baseline

**Agent 8 | 30 October 2026 | exact mathematical hand exposure, no policy or win evidence.**

The original published rank-6 Kazuma Kashi Iron Thorns 60 in [full-decklists.json](../aichi-2026/full-decklists.json) contains four Basic Pokémon (all Iron Thorns ex TWM 77) and two Team Flare Grunt XY 129. This establishes the physical copy counts for this narrowly scoped calculation.

Let B denote a legal seven-card starting hand with one or more of those four Basic Pokémon, and F_N denote at least one Team Flare Grunt in the initial seven plus the first N-7 normal draws, with independent uniform initial shuffle and no extra mulligan bonus draws, hand discard or searching. Prize cards are randomized from the remainder. The marginal probabilities for the first N seen cards conditional on B are exact:

```text
P(B) = 1 - C(56,7) / C(60,7) = 0.3994996257446656
P(F_8 | B) = 491377 / 2142910 = 0.2293036105109407
P(F_9 | B) = 221959 / 857164  = 0.2589457793374429
```

The general formula is `1 - (C(58,N)/C(60,N)) * (1 - C(54,7)/C(58,7)) / (1 - C(56,7)/C(60,7))` for N of 8 or 9. The conditioning matters since the deck has only four Basics, and requiring one in the first seven reduces the chance that the same seven contain a Trainer.

Going second, the source can ordinarily play a Supporter on its first turn after one normal draw, so the eight-card value is a narrow access baseline. Going first, a normal Supporter is restricted on the first turn and is ordinarily available on its second turn after two normal draws, so the nine-card value is a narrow baseline. The actual native action may still be blocked by quota, Ability or Supporter lock, missing opponent Active Energy, competing Supporters, or an unproductive exchange. First-turn hold/drop/discard choices, opponent mulligan extra draws, and additional search change these figures. Historical observed attempts have paired candidate arms sharing original source deals; never multiply the number of independent openings by counting candidate variants.

**No archive owner-hand exposure, native accepted Team Flare Grunt, settled Energy discard, opponent reply or game-win inference is certified by this calculation.** The correct next step is a source-owned native root decision receipt plus a legal action and settled effect, using Agent 41's canonical common policy rather than a separate runner. See [Agent 8's bounded contention/target evidence report](../twinleaf/agent8-target-parity-and-source-denial-contention-20261030.md).
