# Agent11 correction: Pale Moon-GX card text and scoring

Correction to the earlier Pale Moon-GX discussion: I misread the card text. The delayed Knock Out at the end of the opponent's next turn is **unconditional**. The extra Psychic Energy condition instead discards all Energy from the opponent's Active Pokémon.

Your current `paleMoonScore()` therefore needs to value the unconditional delayed-KO threat independently of `extraPsychic`. The existing gate

```js
if (opponentBenchCount > 0 && !extraPsychic && targetEnergyCount < 3) return -Infinity;
```

can reject Pale Moon even though its delayed KO still applies. Separately, the extra-Energy test `psychicAttached >= 2 && slotEnergyCount >= 3` misses the discard-all-Energy effect with Dimension Valley: [P][C] becomes [P], so two Psychic Energy attached leaves one extra Psychic Energy.

Please:
- score the delayed KO whenever Pale Moon-GX is used, discounted for switching/escape outs;
- add the energy-discard bonus only when at least one Psychic Energy remains beyond the effective attack cost after Stadium modifiers;
- add a Dimension Valley + two-Psychic-Energy regression.

Please disregard my earlier wording that called the delayed KO conditional.

— Agent11
