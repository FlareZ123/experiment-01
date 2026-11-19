# Rank-4 Reversal / Counter Energy gate for Extra Energy Bomb → Electro Rain

**Status: rules-text derivation; native confirmation required.** This is a new interaction constraint for the rank-4 Raichu / Electrode opponent-policy lane. It does not change the frozen v1 policy or its held-out suite.

## Exact source composition

Rank 4 (Shu Hosoda) contains 12 Special Energy cards:

| Printing | Count | Conditional Lightning access on Alolan Raichu |
|---|---:|---|
| Reversal Energy PAL 192 | 4 | Every type, up to 3 Energy at a time, only if the player has more Prize cards remaining and the attachment is to an Evolution Pokémon without a Rule Box |
| Counter Energy CIN 100 | 4 | Every type, up to 2 Energy at a time, only if the player has more Prize cards remaining and the attachment is to a Pokémon that is neither Pokémon-GX nor Pokémon-EX |
| Unit Energy LPM UPR 138 | 4 | Lightning, Psychic and Metal, one Energy at a time; no Prize condition |

The source list also has 3 Electrode-GX CES 48 and 2 Alolan Raichu UNM 57. The local card-pool records are `resources/cards/en/sm7.json` (Electrode-GX), `resources/cards/en/sm11.json` (Alolan Raichu), plus the rank-4 row in `results/aichi-2026/full-decklists.json`.

External card-text cross-checks:
- [Reversal Energy PAL 192](https://limitlesstcg.com/cards/en/PAL/192)
- [Counter Energy CIN 100](https://limitlesstcg.com/cards/cin/100)
- [Unit Energy LPM UPR 138](https://limitlesstcg.com/cards/UPR/138)

## Derivation

1. Extra Energy Bomb says to attach **5 Energy cards** from the discard pile to Pokémon other than Pokémon-GX/EX, in any way, then Electrode-GX is Knocked Out. Alolan Raichu is a Stage 1 non-GX Pokémon, so it is an eligible target.
2. The Electrode-GX Knock Out gives the opponent 2 Prize cards under the Pokémon-GX rule.
3. Let (p_A) and (p_B) be the rank-4 player's and opponent's Prize cards remaining immediately before Extra Energy Bomb. After the self-KO, assuming the opponent has at least 2 Prizes remaining:
   [
   p_A' = p_A,qquad p_B' = p_B - 2.
   ]
   Reversal Energy and Counter Energy's shared Prize condition is active exactly when:
   [
   p_A' > p_B' iff p_A + 2 > p_B.
   ]
   In words: after the Electrode self-KO, the rank-4 player must have strictly more Prizes remaining. If rank 4 had already taken at least two more Prizes than the opponent, the condition is not met. If the opponent has fewer than two Prizes remaining, use (p_B' = max(0,p_B-2)).
4. Alolan Raichu qualifies for both conditional Energies: it is an Evolution Pokémon with no Rule Box, and it is neither Pokémon-GX nor Pokémon-EX. Therefore, if the Prize condition is active after the KO, both Reversal Energy and Counter Energy can provide Lightning Energy on Alolan Raichu. Unit Energy LPM can always provide Lightning.
5. With the condition active, the strongest five-card attachment set available in this list is 4 Reversal Energy + 1 Counter Energy: (4\times3 + 1\times2 = 14) Lightning Energy units. This is a rules-text-derived *unit ceiling*, not a confirmed Electro Rain damage result.
6. Without the Prize condition, Reversal and Counter provide only Colorless Energy. The four Unit Energy LPM copies are then the only cards in this package that can provide Lightning, so a five-card Extra Energy Bomb attachment can contain at most four Lightning-providing Energy cards/units.

Alolan Raichu's local `Electro Rain` text is: “Discard any amount of Lightning Energy from this Pokémon. Then, for each Energy you discarded in this way, choose 1 of your opponent's Pokémon and do 30 damage to it.” It is important that the text says **each Energy**, not **each Energy card**. Since Reversal and Counter can provide 3 and 2 Energy units respectively, the engine must be tested to determine whether discarding one such card counts as 3 or 2 Energy for Electro Rain, or only as one discarded card.

## Required native test matrix

Do not encode the 14-unit / 420-damage interpretation into a policy until these cases pass against the pinned engine and are reconciled with paper rules.

| Case | Prize state before Extra Energy Bomb | Five cards attached to Alolan Raichu | Expected Energy state after Electrode KO | Question |
|---|---|---|---|---|
| A | Both players at 6 | 4 Reversal + 1 Counter | Prize condition becomes active (6 vs 4) | Does the attached set immediately provide 14 Lightning Energy units? |
| B | Rank 4 has taken 1 prize; opponent 0 | 4 Reversal + 1 Counter | Prize condition becomes active (5 vs 4) | Same unit count after self-KO? |
| C | Rank 4 has taken 2 prizes; opponent 0 | 4 Reversal + 1 Counter | Prize condition is false (4 vs 4) | Do Reversal/Counter remain Colorless, leaving only the four Unit Energy copies as Lightning sources? |
| D | Rank 4 has taken 2 prizes; opponent has taken 1 | 4 Reversal + 1 Counter | Prize condition becomes active (4 vs 3) | Confirm the exact strict-inequality boundary. |
| E | Both players at 6 | 4 Unit + 1 Counter | Prize condition becomes active after KO | Does Counter switch from Colorless to every type/2 Energy after the Prize count changes? |

For each case, record:
- the five physical Energy cards attached (not only the total Energy units);
- the Energy types and units provided before and after the self-KO;
- whether the conditional Energy effects update immediately when the Prize count changes;
- how many Lightning Energy units Electro Rain is allowed to discard;
- how many 30-damage placements are generated, including repeated targets;
- a native effect receipt and a paper-rules ruling for the unit-versus-card counting question.

## Policy consequence

A future policy version should make Extra Energy Bomb's five-card attachment and Electro Rain's damage-allocation decisions prize-state-aware. It should prefer 4 Reversal + 1 Counter only when the post-KO Prize inequality activates both cards; otherwise it must not treat those cards as Lightning sources. Unit Energy LPM remains the unconditional Lightning source. The current v1 policy deliberately abstains from Extra Energy Bomb and Electro Rain because `AttachEnergyPrompt` and `PutDamagePrompt` are unsupported; this note does not relax that guard.

**Confidence:** high on source counts and printed conditions; medium on the post-KO continuous-effect timing; unresolved on how the pinned engine and paper rules count multi-unit Energy cards for Electro Rain. No game, simulation, matchup or win-rate evidence is claimed.
