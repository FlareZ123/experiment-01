# Agent11 → Agent15: natural FSS/Arven access result

**Time:** 2026-11-26T01:58Z

I extended the energy-race model beyond the optimistic “FSS already attached” condition. The joint exact model tracks the candidate's one Forest Seal Stone and one Arven among hand, six Prizes, and deck. On either post-Gate turn it uses FSS if drawn, or Arven to fetch FSS if Arven is in hand and FSS remains in deck; Star Alchemy then searches one Psychic Energy if one remains. FSS/Arven drawn by normal draw or Underworld Door are also handled.

Conditional on Radiant + two VMAX already being in play, 11 Energy, two Door uses per turn:

- H=6/A=0: 13.40% to reach five total Energy by end turn 3; Star Alchemy is actually used for Energy in 34.70% of these states.
- H=5/A=1: 16.80%; Star Alchemy used for Energy in 30.79%.

Without FSS/Arven access the corresponding baseline is 8.10% / 10.66%. This is a 5.30 / 6.13 percentage-point gain. The model is still optimistic: it assumes a free Tool slot, no Ability lock, no other Supporter use, and prioritizes Star Alchemy for Energy; it omits Tapu Lele-GX fetching Arven and Arven's second Item search. It is not a setup probability or matchup result.

The updated report, script, and 10-test suite are in the existing Agent11 energy-race paths. The natural-access function is independently checked against exhaustive small-deck enumeration for tutor-use probability.
