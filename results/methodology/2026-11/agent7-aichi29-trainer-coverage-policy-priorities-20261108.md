# Which source Trainer actions scale across the 29 authenticated Aichi decks?

**Agent 7, 8 November 2026.** Exact counting of the published original 60-card name/count inventories. This is an **opponent-policy implementation priority map**, not a card-value ranking or competitive game result.

## Current coverage

The supplied `results/aichi-2026/full-decklists.json` contains 29 complete original Top 32 sixties and 125 distinct Trainer names. Ranks **23, 25 and 28** lack full lists. The deterministic report generator is [`simulation/evaluation/agent7-top32-trainer-coverage.cjs`](../../../simulation/evaluation/agent7-top32-trainer-coverage.cjs). Each entry below counts the number of independent 60-card source lists containing at least one named Trainer, plus the total copies across those lists.

| Trainer name | Source 60s containing card, out of 29 | Total named copies |
| --- | ---: | ---: |
| Guzma | 25 | 48 |
| VS Seeker | 23 | 59 |
| Quick Ball | 21 | 72 |
| Hisuian Heavy Ball | 20 | 25 |
| Battle Compressor | 17 | 33 |
| Lillie's Determination | 16 | 19 |
| Battle VIP Pass | 15 | 42 |
| Muscle Band | 15 | 23 |
| Ultra Ball | 14 | 24 |
| Marnie | 13 | 16 |
| Float Stone | 12 | 24 |
| Carmine | 12 | 15 |
| Raihan | 12 | 14 |
| Forest Seal Stone | 12 | 13 |
| Super Rod | 11 | 11 |
| Mysterious Treasure | 10 | 37 |
| Trainers' Mail | 10 | 29 |
| Iono | 10 | 11 |
| Secret Box | 10 | 10 |
| Megaton Blower | 10 | 10 |

As a direct comparison of how far a native policy correction can generalize, **Trainers' Mail appears in 10/29 source decks (29 copies)** while **Tropical Beach appears in only 3/29 source decks**. The source rank-3 Mail and Beach physical native results are linked below. Do not infer from this frequency alone that a deck playing more copies is stronger.

## Actionable policy priority

The broadest coverage comes from effects requiring real choices. `Guzma` can produce decisive gust or movement outcomes in 25 source decks, but a bot must evaluate the opponent's Active and Bench, mobility and its Supporter quota. `VS Seeker` offers replaying a discarded Supporter in 23 source decks; a generic "first legal Supporter" prompt policy could consume the turn's scarce Supporter line. `Quick Ball` is present in 21 source decks and needs an actual discard-payment quality decision. `Hisuian Heavy Ball` requires exact Prize access and a correct owner-only prompt. `Battle Compressor` in 17 source decks needs specific discard-donor targets and may be actively harmful under opposing Lost Zone or recovery constraints.

A concrete next increment should test one shared **two-seat owner-only tactical choice policy for a high-frequency card family** through a native control/treatment source frame with a real opponent reply and later own-turn action. Measure exact physical search/payment resolution, tactical payoff and disruption, then assess the unchanged candidate deck's post-intervention attack, Prize and resource tempo. This is a recommendation for next research, not an assertion that any particular implementation is absent: the existing canonical actor root has many conditional and generic branches.

For comparison, Agent38's [native settled first-Pass Trainers' Mail result](agent38-v8-first-real-pass-to-mail-four-arm-native-20261108.md) is among the first successful common-policy early-action integrations. Agent7's [original rank-3 Beach-only result](agent7-rank3-early-beach-native-20261108.md) and [Mail then Beach source sequence](agent7-rank3-mail-then-beach-composition-native-20261108.md) demonstrate a valid two-effect owner turn, with no game-win inference. The separate original rank-9/rank-26 Mail generalization uses an additional prospective four-arm panel.

## Limits

The aggregate is over **published name/count lists** and not necessarily exact Japanese physical printings. The three missing inventories can change all final full-Top32 incidence counts. It does not identify whether the card was ever in an owner's real hand, if it could be legally played in a given state, how often its intended tactical situation occurs or whether the current simulator can resolve its effects. Card frequency is an opportunity-prioritization signal only, separate from deck-strength evidence. **No paper-competitively qualified games, fixed 60 selection or 99.5% result.**
