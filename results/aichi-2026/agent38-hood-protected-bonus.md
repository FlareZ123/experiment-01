# Agent 38: Hood Shield protected VMAX resources under opposing mulligan bonuses

**16 October 2026.** Exact finite-population research on the unchanged [Hood Shield v1 60-card list](candidate-hood-shadow-rider.json). These are setup resource opportunities, with no claimed matchup wins or proven gameplay execution.

## Why this matters against Iron Thorns

Aichi ranks **6, 24 and 29** all published Iron Thorns ex-only Pokémon inventories. Their Active Pokémon must be Iron Thorns ex at setup. Its **Initialization** blocks Radiant Eternatus's Gate and Shadow Rider VMAX's Underworld Door while unsuppressed. This card-text interaction is established in [the original Iron Thorns study](../als/iron-thorns-suppresses-gate.md).

The Hood candidate plays **2 Stealthy Hood** and **1 Arven**. Existing [engine-side staged interactions](hood-arven-interaction.md) show that an equipped Hood can restore Underworld Door and that Arven can search it under suitable circumstances. Opposing Tool removal, Tool-lock responses and Supporter contention remain real constraints.

The [original Hood exact model](candidate-hood-shadow-rider.md) found a **7.714336%** natural turn-two VMAX plus direct/searchable Hood resource opportunity when no opponent bonus cards are drawn. This extension uses the same frozen inventory and a full exact two-player mulligan distribution.

## Modeled resource event

An accepted initial seven must have some Basic. By the end of turn one, Shadow Rider Calyrex V must have been drawn so it can enter play. By the beginning of turn two, at least one VMAX must have been found through ordinary cards drawn. In addition, either Stealthy Hood must be directly in the hand or Arven must be in hand with at least one Hood still in the searchable post-Prize deck.

This assumes that an Arven Supporter turn is available and its Tool search can resolve. No Energy attachments, opponent action or actual evolution declaration are simulated.

| Conditional on legal starting seven | No bonus draws | Versus four-Basic opponent, all offered bonuses accepted |
| --- | ---: | ---: |
| V-by-T1 and VMAX-by-T2 resources | 23.014369% | 28.733176% |
| Also directly holding Stealthy Hood | 5.456979% | 8.431434% |
| Additional Arven to still-deck Hood route | 2.257357% | 3.225569% |
| **Natural VMAX plus direct or searchable Hood** | **7.714336%** | **11.657003%** |

The four-Basic-opponent bonus distribution increases the protected opportunity by **3.942667 percentage points**. Under the same model, **40.569839%** of naturally ready states also offer a Hood or Arven-to-Hood route.

### All published opposing Basic-count profiles

| Opponent Basics | Natural VMAX | Direct Hood | Arven incremental | Direct or Arven Hood |
| ---: | ---: | ---: | ---: | ---: |
| 4 | 28.733176% | 8.431434% | 3.225569% | **11.657003%** |
| 10 | 24.276582% | 6.036608% | 2.462233% | **8.498841%** |
| 11 | 24.043301% | 5.925961% | 2.423804% | **8.349765%** |
| 12 | 23.857366% | 5.838892% | 2.393343% | **8.232235%** |
| 13 | 23.707418% | 5.769406% | 2.368893% | **8.138299%** |
| 14 | 23.585373% | 5.713338% | 2.349072% | **8.062410%** |
| 15 | 23.485326% | 5.667707% | 2.332878% | **8.000585%** |
| 16 | 23.402867% | 5.630322% | 2.319569% | **7.949891%** |

Averaging equally across the **29 published Aichi opponent lists** and their actual Basic counts gives a restricted **8.514018%** Hood-or-Arven protected natural resource opportunity, comprising **6.053565% direct** and **2.460453% Arven incremental**. Three registered Top-32 lists (ranks 23,25,28) are unavailable. This average is about setup resources, and makes no win-rate claim.

## Method

The [source-derived exact enumerator](../../scripts/agent38-hood-protected-bonus.cjs) partitions the actual Hood v1 into **[4 Rider V, 4 VMAX, 2 Hood, 1 Arven, 10 other Basics, 39 other cards]**. It enumerates legal seven-card starting hands, each K offered extra cards and first ordinary draw, and all Prize outcomes. The critical VMAX, Hood and Arven Prize categories are tracked separately, with other Prize identities integrated by binomial coefficients. The second ordinary draw is analytically marginalized across VMAX, Hood, Arven and the remaining cards.

All category weights and successful event counts use BigInt until the final probability ratio. An Arven route counts only if Hood remains in the **searchable deck after the second ordinary draw**, so a Prized singleton or both Prized Hood copies cannot become a fictional search target.

Optional bonus offers are taken until K=45, leaving both ordinary turn draws available; the K>=45 probability tail is applied to the capped event. This follows the established [exact two-player mulligan distribution](../../scripts/aichi_bonus_draws.cjs).

## Validation

An independent [mini-deck exhaustive regression](../../tests/agent38-hood-protected-bonus.test.cjs) enumerates **all 40,320 physical-card permutations** for two different eight-card compositions, across every feasible optional bonus count. It compares four independently classified outcomes: natural VMAX, direct Hood, additional Arven-to-Hood, and either protected route. Prize configurations containing both Hoods are explicitly possible in one mini-deck case.

The K=0 source result reproduces [Agent 15's independently developed original study](../../scripts/hood-t2-joint.cjs). The four-Basic-opponent natural VMAX marginal reproduces the [source-corrected exact natural readiness](agent38-hood-basic-source-audit.md). A full 46-bonus-count regression was added to [manual Aichi statistical CI](../../.github/workflows/aichi-benchmark-stats.yml).

## Interpretation and next test

The arithmetic excludes search and draw beyond optional bonuses, such as Fog Crystal, Mysterious Treasure and Forest Seal Stone. It treats Arven access as strategically available when the category and deck target are present. Opponent Tool removal, attached Tool slot competition, early knockouts, Item and Supporter restrictions, Energy acceleration, and actual attack turns can remove counted opportunities. Additional unmodeled search can create opportunities outside this restricted event.

All three Iron Thorns opponents also possess Tool-removal answers in their full published inventories. A prior staged policy probe chose Fog Crystal plus Float Stone rather than the defensive Arven-to-Hood line even under opposing Initialization. See [the candidate report](candidate-hood-shadow-rider.md) for the opponent-response evidence.

**11.657003% is a restricted access probability under a four-Basic opponent's bonus distribution.** It gives no probability of using Underworld Door, powering an attacker or winning an Iron Thorns match. The next useful policy measurement is the rate at which the fixed candidate actually develops a Hood-protected VMAX, exercises Underworld Door and attacks under genuine Active Initialization and Tool-removal threats.
