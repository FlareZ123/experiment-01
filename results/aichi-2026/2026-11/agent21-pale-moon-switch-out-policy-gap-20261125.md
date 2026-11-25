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

Agent11's exact 29-list census, [Pale Moon-GX delayed-KO escape inventory](agent11-pale-moon-retreat-out-field-census-20261124.md), plus a direct read of the authenticated source lists gives the following coverage map:

| Retreat / switch route | Lists | Copies | Current PR69 policy |
| --- | ---: | ---: | --- |
| Latias ex (Skyliner) | 14/29 | 14 | Modeled as a free-retreat Ability for Basic Pokémon |
| Float Stone | 12/29 | 24 | Modeled |
| U-Turn Board | 2/29 | 2 | Retreat-cost reduction modeled; no direct regression |
| Guzma | 25/29 | 48 | **Not modeled** as a switch-to-Bench escape |
| VS Seeker | 23/29 | 59 | **Not modeled** as recovery of Guzma |
| Battle Compressor | 17/29 | 33 | **Not modeled** as setup for VS Seeker/Guzma |
| Escape Rope | 7/29 | 11 | **Not modeled** as a forced switch-to-Bench escape |
| Acerola | 1/29 | 1 | **Not modeled**; can pick up a damaged target and clear its effects |

All **9/9 authenticated Regidrago lists** contain Guzma and VS Seeker; 7/9 also contain Battle Compressor. This is a prevalence signal, not proof that a particular opponent has the card in hand on the relevant turn. The policy should estimate hidden access rather than assume the out is certain. Escape Board is absent from the Aichi 29 but is Expanded-legal; its separate Paralyzed-status test defect is documented below.

A concrete counterexample is an opponent Regidrago VSTAR with three Retreat Cost Energy, no attached Energy, and at least one Benched Pokémon, while the opponent has access to Guzma or Escape Rope. The current `paleMoonScore()` treats the target as unable to retreat and awards the delayed-KO bonus; a switch effect moves it to the Bench and clears that effect. The immediate Energy denial from Pale Moon-GX's extra-Psychic clause remains valuable and must be scored separately.

## Direct Escape Board / Paralysis rules contradiction in the current test

There is also a discrete rules defect in the same retreat helper. In `paleMoonRetreatStatus()`, line 869 returns `canRetreat: false` immediately for `Paralyzed`, before it checks whether Escape Board is attached at lines 874–875. The current test at `tests/2026-11/agent46-candidate-policy.test.cjs` lines 4082–4091 explicitly expects a Paralyzed Regidrago VSTAR with Escape Board UPR 122 to be unable to retreat.

The repository card-pool record `resources/cards/en/sm5.json`, Escape Board SM5 122, says the attached Pokémon's Retreat Cost is reduced by one Colorless and **it can retreat even if it is Asleep or Paralyzed**. The same record marks it **Expanded legal**. The test fixture has one Colorless retreat cost and one Fire Energy, so Escape Board reduces the cost to zero; the correct `canRetreat` result is **true**, just as it is for the preceding Asleep+Escape Board fixture. The current code and test therefore contradict the card text and can overvalue Pale Moon's delayed-KO effect in that state.

No authenticated Aichi Top 32 list contains Escape Board, so this is a general paper Expanded rules/contract defect, not an Aichi-field prevalence claim. It still needs correction before treating the retreat evaluator as rules-complete.

## Practical hidden-out estimator

For a known benchmark list, the switch-out term can be estimated from public zones rather than treating list inclusion as certainty. Let (N=H+D+P) be the opponent's unknown cards across hand, deck, and remaining prizes, with current hand size (H), deck count (D), and prize count (P). If (k) known-remaining direct outs are in that unknown pool, the baseline probability that at least one is in hand is:

[
1 - \frac{\binom{N-k}{H}}{\binom{N}{H}}.
]

Use the remaining counts after subtracting public discard and in-play cards. Direct outs include Guzma, Escape Rope, and Switch; Acerola is conditional on the target already having damage counters. Add separate events for **VS Seeker + Guzma already in discard**, and for **Battle Compressor + VS Seeker in hand with a Guzma still in deck**. VS Seeker alone is not an out if there is no Guzma in discard, and Battle Compressor is only useful when a Guzma remains in deck. A multivariate hypergeometric over the unknown hand/deck/prize allocation can combine these events without double-counting. The estimate should also require a usable opponent Bench and respect Item/Supporter sequencing. This gives the policy a grounded probability, not a false certainty.

## Narrow remediation if separately authorized

1. Keep the immediate Energy-discard value as its own term; it is not undone by a later switch.
2. Reduce the delayed-KO component when public information and the opponent's authenticated decklist show switch routes. Account for opponent Bench availability, Guzma in the list/discard, VS Seeker recovery, Escape Rope/Switch counts, Acerola when the target already has damage counters, public hand count, remaining deck/prizes where known, and Supporter/Item constraints.
3. Treat these as hidden-card probabilities or conservative discounts, not deterministic knowledge from deck inclusion alone. Do not infer a switch card is in hand merely because the 60 contains it.
4. Add both-seat tests where the target cannot retreat but can be switched by Guzma, VS Seeker→Guzma, or Escape Rope; include no-Bench and no-remaining-out controls. Assert the delayed-KO score falls while the extra-Psychic Energy-denial value remains.

No PR #69 code or tests were changed. The branch remains frozen pending owner/Critic scope. The existing Agent11 census is the field source; this note connects it to the actual worker scoring path. No game outcome or win-rate claim is made.