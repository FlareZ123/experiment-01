# Agent21: Pale Moon-GX switch-out blind spot in PR #69

**Date:** 25 November 2026  
**Decision relevance:** candidate-policy competence and the value of the fixed deck's Pale Moon-GX counterline. This is a source/rules/policy review, not a matchup result.

## Finding

The current PR #69 worker scores Pale Moon-GX's delayed Knock Out using only the target's retreat status. It does not account for the target being switched to the Bench by an Item or Supporter, even though switching removes attack effects just as retreating does.

At branch `agent46/candidate-policy-competence-20261124`, head `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`:

- `paleMoonScore()` calls `paleMoonRetreatStatus()`, then discounts the delayed-KO score only when retreat is possible/free or the retreat state is unknown. It uses opponent Bench count only to distinguish a no-Bench case.
- It does not inspect opponent switch-card access (Guzma, VS Seeker, Escape Rope, Switch, etc.), public discard/remaining counts, or a probabilistic hidden-card estimate.
- The existing Pale Moon tests exercise retreat Energy units, Double Dragon Energy, Dimension Valley, Latias ex Skyliner, Float Stone/Escape Board, and Asleep/Paralyzed. They do not test an opponent moving the affected Active Pokémon to the Bench with a switch effect.

## Paper rules

The repository's Advanced Player's Rulebook explicitly states:

- Retreat (A-03): when an Active Pokémon moves to the Bench, it loses all Special Conditions and any effects it had on it.
- Switch (C-03): switching the Active Pokémon with a Benched Pokémon removes its Special Conditions and effects.
- Switch out opponent's Active (C-04): switching the opponent's Active Pokémon to the Bench removes its Special Conditions and effects.

Pale Moon-GX's delayed Knock Out is an effect on the Defending Pokémon. Therefore, a legal switch to the Bench clears it; the policy must not treat retreat cost as the only escape route.

## Aichi field relevance

Agent11's exact 29-list census, [Pale Moon-GX delayed-KO escape inventory](agent11-pale-moon-retreat-out-field-census-20261124.md), reports:

| Public switch route | Authenticated lists | Copies | Relevance |
| --- | ---: | ---: | --- |
| Guzma | 25/29 | 48 | Moves the opponent's Active to the Bench |
| VS Seeker | 23/29 | 59 | Can recover a discarded Guzma |
| Battle Compressor | 17/29 | 33 | Can put Guzma into the discard pile for VS Seeker |
| Escape Rope | 7/29 | 11 | Additional Item switch route |

All **9/9 authenticated Regidrago lists** contain Guzma and VS Seeker; 7/9 also contain Battle Compressor. This is a prevalence signal, not proof that a particular opponent has the card in hand on the relevant turn. The policy should estimate hidden access rather than assume the out is certain.

A concrete counterexample is an opponent Regidrago VSTAR with three Retreat Cost Energy, no attached Energy, and at least one Benched Pokémon, while the opponent has access to Guzma or Escape Rope. The current `paleMoonScore()` treats the target as unable to retreat and awards the delayed-KO bonus; a switch effect moves it to the Bench and clears that effect. The immediate Energy denial from Pale Moon-GX's extra-Psychic clause remains valuable and must be scored separately.

## Narrow remediation if separately authorized

1. Keep the immediate Energy-discard value as its own term; it is not undone by a later switch.
2. Reduce the delayed-KO component when public information and the opponent's authenticated decklist show switch routes. Account for opponent Bench availability, Guzma in the list/discard, VS Seeker recovery, Escape Rope/Switch counts, public hand count, remaining deck/prizes where known, and Supporter/Item constraints.
3. Treat these as hidden-card probabilities or conservative discounts, not deterministic knowledge from deck inclusion alone. Do not infer a switch card is in hand merely because the 60 contains it.
4. Add both-seat tests where the target cannot retreat but can be switched by Guzma, VS Seeker→Guzma, or Escape Rope; include no-Bench and no-remaining-out controls. Assert the delayed-KO score falls while the extra-Psychic Energy-denial value remains.

No PR #69 code or tests were changed. The branch remains frozen pending owner/Critic scope. The existing Agent11 census is the field source; this note connects it to the actual worker scoring path. No game outcome or win-rate claim is made.