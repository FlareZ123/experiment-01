# Rank-1 near-mirror inventory and field-mean threshold

**15 November 2026 · Agent5 · inventory comparison and algebra only · no gameplay or win-rate claim**

## Question

How close is the active Hood Shield Shadow Rider v1 candidate to the published Aichi rank-1 champion list, and what does that imply for the 99.5% field-mean objective?

## Inputs and method

- Candidate: `results/aichi-2026/candidate-hood-shadow-rider.json`
- Champion reference: `results/aichi-2026/benchmark-shadow-rider.md`

Parsed card counts by **card name**, then computed the multiset intersection:

`shared = Σ_card min(candidate_count(card), champion_count(card))`

This comparison is intentionally printing-agnostic. It does not establish exact printing identity or paper legality; the candidate has a separate Japanese pre-event Energy-print manifest.

## Result

Both lists contain 60 cards. The multiset intersection is **55/60 card-name copies**, leaving five card-name substitutions:

| Candidate adds | Champion removes |
|---|---|
| +1 Shadow Rider Calyrex V | -1 Tapu Lele-GX |
| +1 Pokémon Ranger | -1 Carmine |
| +2 Stealthy Hood | -1 Tulip |
| +1 Arven | -1 VS Seeker |
|  | -1 Sky Field |

This is a list-similarity measurement only. It is **not** evidence that either list is stronger, that the matchup is a mirror in play, or that the candidate has any particular win rate.

## Necessary rank-1 threshold under an equal-weighted field mean

If the aggregate target is interpreted as an equal-weighted mean over all 32 ranks, then even assuming the candidate wins **100%** of games against each of the other 31 ranks, rank 1 must satisfy:

[
(31 + p_1)/32 ge 0.995
]

[
p_1 ge 32(0.995)-31 = 0.84
]

So rank 1 must be at least **84%** under that exceptionally favorable assumption. Any losses in the other 31 matchups raise the required rank-1 rate. If the objective instead means at least 99.5% against *each* opponent, the rank-1 requirement remains 99.5%; the 84% result is specific to the equal-weighted-mean interpretation.

## Card-text counterlines to preserve in evaluation

- The champion list has one **Field Blower**. If both candidate Stealthy Hoods are attached simultaneously, one Field Blower can discard both. This is a real card-text counterline, not matchup evidence. Preserve attachment timing and the exact Tools discarded in the rank-1 trace.
- The two-Hood package has a distinct rank-15 rationale. Agent50's Hood Shield policy spec identifies a conditional Copycat → Gale Thrust route against Vileplume BUS6: Stealthy Hood attached to Mimikyu before Vileplume AOR3's Item lock prevents Disgusting Pollen's effect on it; the published rank-15 list has no Field Blower or Faba to remove the attached Hood. Exact Underworld Door/Guzma prerequisites are in Agent41's fuel-line analysis. This too is rules-derived, not native-tested or a matchup result.

These two constraints should be evaluated together. Do not cut the Hoods from the rank-1 Field Blower interaction alone, and do not retain them solely because of the conditional rank-15 route.

## Next evidence

After V3 acceptance:
1. Keep the first natural rank-1 game diagnostic only.
2. Run a frozen two-seat / play-draw matched rank-1 panel with paired conditions and per-seat outcomes.
3. Record whether both Hoods are attached when Field Blower is played, which Tools it removes, whether the defensive plan survives, and how often the candidate accesses the rank-15 Hood/Mimikyu line in the relevant matchup.
4. Only then decide whether the five substitutions improve the whole field. Do not infer a winner from this inventory comparison.

## Limitations

- No complete game, matched panel, or matchup estimate is reported here.
- The 84% threshold assumes equal rank weighting and perfect results against every other rank; it is a mathematical boundary, not a forecast.
- Similarity is by card name, not exact printing.
- The rank-15 line is conditional on the actual prior-turn attack, board state, and setup timing; it is not automatically available because Mega Lopunny ex appears in the opponent's list.
