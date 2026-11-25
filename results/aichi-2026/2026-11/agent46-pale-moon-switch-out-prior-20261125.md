# Pale Moon-GX hidden switch-out access prior

**Author:** Agent46  
**Date:** 2026-11-25  
**Dataset:** `results/aichi-2026/full-decklists.json` (29 authenticated Top 32 lists; ranks 23, 25 and 28 remain missing)  
**Reproduction:** `node scripts/agent46-pale-moon-switch-out-prior.cjs`

## Decision-relevant result

The existing Pale Moon retreat helper models public retreat routes, but it cannot treat a blocked retreat as a guaranteed delayed Knock Out: the published opponent lists contain direct switch/return routes and a small Battle Compressor + VS Seeker + Guzma access line.

Under the explicit static prior below, the probability that a random opponent hand contains one of the modeled escape lines is:

| Field subset | H=4 | H=5 | H=6 | H=7 |
|---|---:|---:|---:|---:|
| All 29 lists | 13.9% | 17.3% | **20.8%** | **24.2%** |
| 9 Regidrago lists | 14.4% | 18.0% | **21.7%** | **25.3%** |

At H=6 across all 29 lists, direct outs contribute 19.5 percentage points and the Battle Compressor + VS Seeker + Guzma-in-deck combo adds 1.2 points. For the nine Regidrago lists, the corresponding components are 20.1 and 1.6 points. If the target is damaged and Acerola is legal, the all-field H=6 mean rises from 20.8% to 21.1%; only rank 1 has Acerola in this dataset.

These are **hand-access priors**, not switch-out execution rates, game win rates, or matchup results. They are large enough to justify treating the delayed-KO line as probabilistic rather than certain, but they do not determine whether Pale Moon is strategically correct in a particular state.

## Model

For a 60-card list, hand size (H), and six Prizes:

- Direct outs are Guzma, Escape Rope, and Scoop Up Cyclone. Scoop Up Cyclone returns one of the opponent's Pokémon and all attached cards to hand; it is an ACE SPEC Item.
- The access combo is at least one Battle Compressor and one VS Seeker in hand, plus at least one Guzma remaining in the deck. It assumes the Supporter slot is unused and Items can be played.
- Acerola is excluded from the main result and added only in the conditional “target damaged” calculation, because it requires damage counters on the target.

Let (k) be the number of direct outs, (v) the VS Seeker count, (b) the Battle Compressor count, and (g) the Guzma count. Then:

[
P(\text{direct})=1-\frac{\binom{60-k}{H}}{\binom{60}{H}}
]

Conditioning on no direct out in hand, let (N=60-k). The probability of holding both access Items is:

[
P(\text{VS}\geq1,\text{BC}\geq1\mid\text{no direct})
=1-\frac{\binom{N-v}{H}}{\binom{N}{H}}
-\frac{\binom{N-b}{H}}{\binom{N}{H}}
+\frac{\binom{N-v-b}{H}}{\binom{N}{H}}
]

Given no Guzma in hand, the probability at least one Guzma is in the deck rather than the six Prizes is:

[
P(\text{Guzma in deck})=1-\frac{\binom{6}{g}}{\binom{60-H}{g}}
]

The reported access prior is the direct-out probability plus the disjoint no-direct / BC+VS / Guzma-in-deck event. The script calculates this for H=4–7 and each of the 29 exact lists.

## Per-list results

Percentages are the modeled hand-access prior. “H=6 if damaged” includes Acerola only where the list contains it and the target is assumed damaged.

| Rank | Archetype | Direct copies | VS Seeker | Battle Compressor | H=6 | H=7 | H=6 if damaged |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Shadow Rider Calyrex | 1 | 3 | 1 | 12.0% | 14.3% | 21.0% |
| 2 | Vileplume Control | 2 | 0 | 0 | 19.2% | 22.1% | 19.2% |
| 3 | Snorlax Stall | 2 | 3 | 0 | 19.2% | 22.1% | 19.2% |
| 4 | Raichu Electrode Combo | 3 | 0 | 4 | 27.5% | 31.5% | 27.5% |
| 5 | Mew Genesect | 3 | 2 | 0 | 27.5% | 31.5% | 27.5% |
| 6 | Iron Thorns | 3 | 3 | 0 | 27.5% | 31.5% | 27.5% |
| 7 | Snorlax Stall | 1 | 3 | 0 | 10.0% | 11.7% | 10.0% |
| 8 | Absol Garbodor | 1 | 3 | 2 | 13.8% | 16.7% | 13.8% |
| 9 | Absol Electrode | 3 | 2 | 1 | 28.8% | 33.2% | 28.8% |
| 10 | Regidrago | 2 | 3 | 1 | 21.2% | 24.8% | 21.2% |
| 11 | Absol Garbodor | 3 | 1 | 0 | 27.5% | 31.5% | 27.5% |
| 12 | Regidrago | 2 | 3 | 0 | 19.2% | 22.1% | 19.2% |
| 13 | Regidrago | 2 | 3 | 2 | 23.1% | 27.3% | 23.1% |
| 14 | Regidrago | 2 | 3 | 1 | 21.2% | 24.8% | 21.2% |
| 15 | Lopunny Vileplume | 2 | 0 | 0 | 19.2% | 22.1% | 19.2% |
| 16 | Absol Garbodor | 1 | 3 | 3 | 15.5% | 18.9% | 15.5% |
| 17 | Raichu Electrode Combo | 3 | 0 | 4 | 27.5% | 31.5% | 27.5% |
| 18 | Regidrago | 3 | 2 | 0 | 27.5% | 31.5% | 27.5% |
| 19 | Raging Bolt | 2 | 2 | 2 | 21.9% | 25.7% | 21.9% |
| 20 | Regidrago | 2 | 2 | 1 | 20.6% | 24.0% | 20.6% |
| 21 | Regidrago | 2 | 3 | 1 | 21.2% | 24.8% | 21.2% |
| 22 | Absol Garbodor | 1 | 3 | 2 | 13.8% | 16.7% | 13.8% |
| 24 | Iron Thorns | 2 | 3 | 0 | 19.2% | 22.1% | 19.2% |
| 26 | Meloetta Donk | 1 | 0 | 4 | 10.0% | 11.7% | 10.0% |
| 27 | Regidrago | 2 | 2 | 1 | 20.6% | 24.0% | 20.6% |
| 29 | Iron Thorns | 3 | 3 | 0 | 27.5% | 31.5% | 27.5% |
| 30 | Lillie's Clefairy | 3 | 2 | 2 | 30.0% | 34.8% | 30.0% |
| 31 | Dusknoir Chimecho | 1 | 0 | 0 | 10.0% | 11.7% | 10.0% |
| 32 | Regidrago | 2 | 2 | 1 | 20.6% | 24.0% | 20.6% |

## Assumptions and limitations

1. The 29 lists are equally weighted; the missing ranks 23, 25 and 28 are not imputed.
2. The hand is a uniform random sample from the 60-card list. Six Prizes are assumed. H is the current hand size, not the number of cards seen.
3. The estimate assumes the opponent has a legal bench for Guzma/Escape Rope, has not used their Supporter or ACE SPEC, and is not under Item lock. It does not condition on known cards in hand, discard, play, deck or Prizes.
4. The BC+VS combo assumes both Items are in hand and at least one Guzma is in the deck. It does not include the additional route where Guzma is already in the discard and VS Seeker alone retrieves it.
5. Other switch/return effects are not included. Retreat modifiers and Latias ex are intentionally excluded because the current retreat helper already models public retreat routes.
6. Acerola is conditional on the target being damaged and the Supporter slot being available.
7. Search, draw, hand selection, prior card use, item locks, target damage, bench state, and turn timing can materially change the actual probability.

Accordingly, this model should be treated as a static prior only. A production policy should update the unknown pool using the actual public state ((N=H+D+P)) and known discards/plays, as described in Agent21's [Pale Moon switch-out policy-gap audit](agent21-pale-moon-switch-out-policy-gap-20261125.md). No policy code has been changed by this result, no games were run, and no matchup or win-rate claim is supported.

## Sources

- Exact decklists: `results/aichi-2026/full-decklists.json`
- Existing field census and state-conditioned estimator: `results/aichi-2026/2026-11/agent21-pale-moon-switch-out-policy-gap-20261125.md`
- Scoop Up Cyclone TWM 162 card text: `resources/cards/en/sv6.json`, card `sv6-162`
- Guzma, Escape Rope, VS Seeker and Battle Compressor card text: pinned local Expanded card pool under `resources/cards/en/`

