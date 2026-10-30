# Aichi four-Basic Iron Thorns publicly reveals control signatures before normal play

**Agent 31 | 30 October 2026 | Evidence: official setup rules + exact geometric/combinatorial calculation, checked against the printed 29-source manifest.** No completed-game, card-effect, performance or competitive-win claims follow.

## Why this is a distinct missing resource channel

The [separate bonus-card result](agent31-four-basic-mulligan-race-20261030.md) quantifies the *other player's optional extra draws* when four-Basic control mulligans. A more consequential opponent-information effect occurs simultaneously. The supplied **Advanced Player's Rulebook, Section I.G step 5(a–d)** requires any player without a Basic in their opening seven to **reveal their full hand to the opponent** before reshuffling. If both players are Basic-free, both reveal and redraw. Every new Basic-free attempt is similarly revealed.

All three published rank **6/24/29** Aichi Iron Thorns 60s have precisely **four Iron Thorns ex as their only Basics**. They each also have **four Plumeria** and **four Speed Lightning Energy**, a combined **eight named non-Basic cards**. Rank 6 and rank 29 additionally have **four Crushing Hammer**. These are exact named-card multiplicities in [the published source 60s](full-decklists.json), not hypothesized additions.

A skilled opponent may thus receive meaningful public signals about the impending control strategy before either normal turn. The currently implemented actor observation only exposes an owner's current hand and current public board; it does not preserve earlier revealed invalid-hand printings in the actor's K0 history. The existing [setup-compensation observer](../../simulation/evaluation/setup-compensation-observer.cjs) retains mulligan *counts* and drawn bonus sizes, but not revealed card names. A correct history-aware opponent policy needs paper-public invalid-hand identities without acquiring concealed deck or Prize identities.

## Exact distribution and expected disclosures

For a 60-card deck with b Basics and t selected non-Basic cards, define:

- q = C(60-b,7)/C(60,7): probability of a Basic-free seven.
- p = 1-q: probability of a valid seven.
- s = 1-C(60-b-t,7)/C(60-b,7): conditional probability a publicly revealed Basic-free seven contains at least one selected card.

Each failed seven is reshuffled into the same deck, so successive attempts are independent. The number K of invalid seven-card hands before the first valid one is geometric: P(K=k)=q^k p. A successful seven is not exposed by this mulligan rule.

The probability an opponent sees **at least one selected card in any failed opening hand** before the first valid opening is therefore

P(revealed >=1 selected card) =
1 - p / [1 - q(1-s)] = q*s / (p+q*s).

The expected failed hands are E[K]=q/p, and expected **card appearances** publicly revealed are 7q/p. The count includes repeated physical cards appearing in different invalid hands; it is not a number of distinct learned identities or bits of strategic information.

| Original opening population | First seven fails | Mean failed seven-card hands | Mean publicly revealed card appearances |
| --- | ---: | ---: | ---: |
| **Rank 6/24/29 Iron Thorns: 4 Basics** | **60.05004%** | **1.50313** | **10.52192** |
| Rank-1 champion: 14 Basics | 13.85907% | 0.16089 | 1.12622 |
| Proposed New Moon: 17 Basics | 8.34374% | 0.09103 | 0.63723 |

These are *owner invalid-hand exposure* marginals. They do **not** depend on the opponent's Basic count because an invalid player reveals that hand whether both players are invalid or only one is. The separate *bonus-card race* does depend on both decks.

## Exact control-card name exposure

| Original source and selected non-Basic card family | Copies t | Chance at least one selected card is publicly revealed before play |
| --- | ---: | ---: |
| Rank 6, 24 or 29: Plumeria | 4 | **38.87645%** |
| Rank 6, 24 or 29: Plumeria + Speed Lightning Energy | 8 | **50.63965%** |
| Rank 6 or 29: Plumeria + Speed Lightning Energy + Crushing Hammer | 12 | **55.64945%** |
| Generic 14-Basic source with four named non-Basic targets | 4 | 7.38982% |
| Generic 17-Basic source with four named non-Basic targets | 4 | 4.54207% |

These selected families are *visible card-name exposure conditions*. Seeing Plumeria or Speed Lightning Energy is not proof that the opponent uniquely identifies Iron Thorns or knows its remaining 60. Conversely, an absence of such a reveal does not establish those cards are absent from the opponent's deck.

If the rank6 target group is Plumeria + Speed Lightning + Crushing Hammer (12 copies), a Basic-free seven contains at least one of those copies with **83.47663%** conditional probability. Across the *random number of repeated failed seven-card hands*, unconditional exposure probability is **55.64945%**. The distinction matters: simply multiplying 83.48% by 60.05% would omit exposure from later failed hands.

## Two-family joint disclosure

For the disjoint four-copy Plumeria and four-copy Speed Lightning Energy families, the chance **both families appear somewhere across all publicly revealed invalid hands** is **27.11324%**. A stronger signal, seeing both families in the *same* invalid hand on at least one attempt, occurs in **19.75242%** of setups. Thus **7.36082 percentage points** reveal both families only across separate mulligan hands. These are inclusion-exclusion and geometric exact results, not measures of actual opponent archetype identification. For any two disjoint families A and B, the across-hands result follows `P(A shown) + P(B shown) - P(A or B shown)`; the same-hand result replaces the conditional per-failed-hand success probability with `1 - P(no A | failed) - P(no B | failed) + P(no A or B | failed)` in the geometric formula.

## Gameplay and information-policy implications

1. **Opponent K0 history matters before an ordinary turn.** A mulligan can disclose source card families and inform matchup hypotheses, card-preservation/discard decisions, setup sequencing, and future play responses. This extends the human-concepts note that opponent mulligans may reveal an archetype; the exact public exposure rate is now computed from original printings.
2. **The same deck construction has two simultaneous costs.** Four Basics produces substantial optional card draws for a 14-Basic opposing deck, and frequent *public failed-hand revelations*. A full-paper-policy simulator should record both while keeping the exact seven(s) that failed separate from the final successful private opening hand.
3. **Do not leak all source cards.** The simulator must only surface cards whose failed hands were actually publicly shown. It must never make the source's current private seven, deck order, concealed Prizes, or full list available to the other actor merely because the benchmark evaluator knows those identities.
4. **Opponent recognition remains an empirical/strategic unknown.** Public signals may change optimal choices, but no actual owner-only classification policy, subsequent action, or opponent response has been demonstrated. The opposing first-player choice occurred before mulligan reveals under the supplied rules and must not be retrospectively changed using this information.

## Reproducibility and scope

- [Exact evaluator](../../scripts/aichi-mulligan-public-reveal.cjs) uses the already-published combination/validity library, returning failed-hand likelihood, exposure chance and expected card appearances.
- [Eight tests](../../tests/aichi-mulligan-public-reveal.test.cjs) cover all three original Iron Thorns source inventories, exact 4/8/12-copy signatures, two other Basic populations, a hand-enumerable miniature geometric example, empty targets and invalid inputs. **All eight passed in a JavaScript verification environment against the live original 29-source manifest. Native Node CI status awaits separate confirmation.**
- Independent 400,000-sample NumPy geometric-check experiment (seed 20261030): the empirical chance of exposing at least one of rank6's twelve selected signature cards was **0.555905** versus exact **0.55649447**; mean failed hands **1.503355** versus exact **1.50313126**.
- Rules: supplied *Advanced Player's Rulebook* Ver 3.4 (1 August 2025), I.G step 5; revealed hand and redrawing conditions.
- Printed card names: [published Aichi original source decklists](full-decklists.json).

The fixed-60 competitive question remains unresolved. There are **29/32** complete Aichi source lists, **zero policy-qualified competitive games**, and **no demonstrated 99.5% deck**.
