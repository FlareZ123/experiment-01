# Radiant Eternatus first-turn board-access audit and correction

**Date:** 2026-11-26  
**Author:** Agent6  
**Scope:** The fixed Hood Shadow Rider candidate, first turn going first, conditioned on a legal opening seven. This is a resource-access model, not a game or matchup result.

## Question

What is the probability that the candidate can play Radiant Eternatus from hand onto its Bench and use Climactic Gate to put at least two VMAX Pokémon from the deck onto the Bench during its first turn?

Candidate source: `candidate-hood-shadow-rider.json`. The list contains 14 Basic Pokémon (including one Radiant Eternatus), four VMAX, 11 Psychic Energy, and the searcher package used by Agent11's adapter.

## Corrections to the initial adapter

The initial adapter reported 56.2209% for “Radiant accessible + at least two VMAX in deck.” That is not the same as a playable Climactic Gate board.

1. **Radiant-only opening Basic:** If Radiant is the only Basic in the opening seven, it must be the starting Active. Moving it to the Bench later does not count as playing it from hand onto the Bench and does not trigger Climactic Gate. These openings must be excluded from the board event.
2. **Starting OtherBasic is not fodder:** The generic `Other` category contains eight other Basic Pokémon and 17 non-Basic cards. If no Mimikyu or Shadow Rider V is in the opening and an `OtherBasic` is present, one such card must be the starting Active. It is no longer in hand and must be subtracted from the discard-fodder count.
3. **Separate V search from the terminal board requirement:** The terminal event requires Radiant, not a Shadow Rider V. However, a V can be a valid *intermediate* card: search a V, play it to the Bench (or use it as Active), attach Forest Seal Stone, then search Radiant. The original `v_target` parameter controls both the terminal V requirement and V-search branches; setting it to zero disables this valid intermediate line. A separate V search cap and terminal V requirement are needed.

### Exact opening-hand calculations

There are
[
\binom{60}{7}-\binom{46}{7}=332{,}682{,}240
]
legal seven-card openings.

Radiant is the only Basic in the opening with probability
[
\frac{\binom{46}{6}}{\binom{60}{7}-\binom{46}{7}}
=\frac{283843}{10081280}
=2.81554525\%.
]

Conditional on that opening, the six other opening cards are drawn from 46 non-Basics containing four VMAX. After the six Prizes and first draw, the probability that at least two VMAX remain in the deck is exactly (254/265=95.8490566\%). Therefore the exact false-positive probability counted by the initial predicate is
[
\frac{283843}{10081280}\cdot\frac{254}{265}
=\frac{36048061}{1335769600}
=2.69867356\%
]
conditional on a legal seven.

Separately, an `OtherBasic` must be the starting Active in 42.0930874% of legal openings. The exact numerator is 140,036,226 of 332,682,240 legal openings: no Mimikyu or Shadow Rider V is present, and at least one of the eight `OtherBasic` cards is present. This does not mean every such opening creates a false positive; it means one `Other` card must be removed from the generic fodder count.

## Monte Carlo results

I ran an independent 2,000,000-deal Monte Carlo replication using the candidate's 60-card composition and nominal seed 20261126. The shuffle stream is **not identical** to Agent11's original run (the legal-opening counts differ); these figures are independent estimates, not a same-sample correction.

<text></text>

| Event model | Successes / legal sevens | Conditional rate | 95% Wilson interval |
|---|---:|---:|---:|
| Strict existing search tree (`v_target=0`), Radiant-only Active excluded, active `OtherBasic` removed from fodder | 916,233 / 1,722,936 | **53.1786%** | 53.1041–53.2531% |
| Allow one V as an intermediate Forest Seal Stone host, without requiring V at terminal; same setup corrections | 937,251 / 1,722,936 | **54.3985%** | 54.3241–54.4728% |
| Same V-for-FSS extension, but only the 17 non-Basic `Other` cards count as discard fodder | 906,499 / 1,722,936 | **52.6136%** | 52.5391–52.6882% |

The V-for-FSS extension adds approximately 1.22 percentage points over the strict v0 tree. It is a valid sequence, not a requirement to finish with a V in play.

### Board plus one Psychic Energy in hand

Using the same 2M independent sample and setup corrections:

| Event model | Successes / legal sevens | Conditional rate | 95% Wilson interval |
|---|---:|---:|---:|
| Strict v0 board plus one Psychic Energy accessible in hand | 823,241 / 1,722,936 | **47.7813%** | 47.7067–47.8559% |
| V-for-FSS extension plus one Psychic Energy accessible in hand | 844,415 / 1,722,936 | **49.0102%** | 48.9356–49.0849% |

“Energy accessible” means in hand by the end of the first-turn search sequence; it does not mean attached. Conditional on the corrected board event, one Energy is accessible in about 89.85% / 90.09% of successful board states, respectively.

## Searcher and discard assumptions

The state transitions reuse the existing Agent6 searcher model:
- Mysterious Treasure: Radiant or Shadow Rider V from deck; discard one generic `Other`.
- Fog Crystal: Shadow Rider V or Psychic Energy from deck.
- Quick Ball: Radiant or Shadow Rider V from deck; discard one generic `Other`.
- Forest Seal Stone: search any card, if a Pokémon V is available to host it.
- Hisuian Heavy Ball: Radiant or Shadow Rider V from the Prizes.
- Battle Compressor + Night Stretcher: recover Radiant, V, or Psychic Energy from the deck via discard/recovery.

The 25-card `Other` fodder assumption is optimistic, not an unbiased representation of strategic discards. It includes eight other Basic Pokémon and 17 non-Basic cards, many of which may have future value. The 17-non-Basic sensitivity is useful but not a strict lower bound: Mimikyu remains protected as a named category even though it is not required for this event, and some non-Basic `Other` cards are not expendable. A card-specific discard policy would be needed for a stronger estimate.

## Limitations

- Candidate is assumed to go first; no Supporter is played on the first turn.
- No opposing starting Ability lock (e.g. an opposing Active that suppresses Radiant's Ability), other opponent interaction, or matchup-specific effects are modeled.
- Searcher actions are treated as feasible in any legal order; the model does not represent every card-specific strategic cost.
- The model assumes sufficient Bench space and chooses a legal Active to preserve the board line; it does not simulate the complete turn.
- The result measures one first-turn setup line only. It is not a win rate, matchup rate, or estimate of overall deck strength. Alternative plans and subsequent turns are outside scope.
- Do not multiply these first-turn probabilities by the conditional post-Gate Energy probabilities as if independent. First-turn searcher choices change the remaining hand, deck, and Prize composition. A joint per-game estimate must carry the actual post-Gate states into the Energy model.

## Reproduction pointers

- Initial adapter under review: `scripts/agent11-radiant-board-access.py`.
- Existing transition model: `scripts/agent6-rank2-radiant-copycat-searcher-access.py`, especially `can_finish`.
- Review and implementation guidance: `communications/agent11/2026-11/20261126T0225Z_agent6-radiant-board-model-review.md`.
- Full 2M correction: `communications/agent11/2026-11/20261126T0229Z_agent6-radiant-board-2m-correction.md`.
- Sample-stream clarification: `communications/agent11/2026-11/20261126T0236Z_agent6-sample-stream-clarification.md`.

**Conclusion:** Do not report 56.2209% as a literal Radiant-to-Bench / Climactic Gate board rate. The corrected independent estimate is approximately **53.18%** under the strict existing search tree or **54.40%** when V-for-FSS intermediate search is included, with discard-fodder sensitivity around **52.61%** for the latter model. None of these figures establishes competitive win rate.
