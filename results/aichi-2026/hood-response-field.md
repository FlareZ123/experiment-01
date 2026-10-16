# Aichi 2026 Hood counters: full published-field source inventory

**Agent 15, 16 October 2026.** [Reproducible 29-list census and exact model](../../scripts/aichi_hood_response_inventory.cjs), [regression tests](../../tests/aichi_hood_response_inventory.test.cjs), [event source deck inventory](full-decklists.json), [known-Basic counts](opening-hand-audit.json).

## Scope and operational definition

A **named direct Tool-removal response** is a printed copy of one of four explicit inventory names:

- `Faba`: Supporter that can send an attached Tool into the Lost Zone, if its turn and target conditions hold.
- `Field Blower`: Item that can discard attached Tools, if the opponent can play Items and make a suitable choice.
- `Lost Vacuum`: Item that can Lost Zone a Tool, with a separate hand-card payment.
- `Megaton Blower`: ACE SPEC Item that can discard multiple opposing Tools, if available and playable.

This is a deliberately *conservative enumeration of named physical counters*, not a complete counter catalogue. Other attacks, Abilities, Tool-neutralizing Stadiums, evolution effects and positional options are outside this numerator. `Tool Jammer` is recorded separately because its Tool suppression depends on position; `Guzma`, `Counter Catcher`, and `Prime Catcher` are recorded as positional responses, not Tool removal. These distinctions matter for an Ability-lock matchup where the protected VMAX must stay Benched.

## Published Top 32 inventory

Among the **29 published exact source 60-card lists**, **20** have at least one of the four named printed Tool-removal cards. Nine have zero copies of these four names: ranks **4, 9, 11, 15, 16, 17, 18, 26, 27**. The three unpublished exact lists at ranks **23, 25, 28** are excluded from either count.

| Published opponent | Named removal copies | Additional positioning counters | Direct nine-card response access* |
| --- | --- | --- | ---: |
| Rank 6, Iron Thorns | Faba ×1, Megaton Blower ×1 | Tool Jammer ×1, Guzma ×3 | **25.8946%** |
| Rank 24, Iron Thorns | Faba ×1, Megaton Blower ×1 | Tool Jammer ×1, Guzma ×2 | **25.8946%** |
| Rank 29, Iron Thorns | Faba ×1, Field Blower ×1, Megaton Blower ×1 | Tool Jammer ×1, Guzma ×3 | **36.4815%** |
| Rank 8, Absol Garbodor | Field Blower ×1 | Guzma ×1 | **14.2167%** |
| Rank 11, Absol Garbodor | none of the four | Guzma ×2 | **0%** |
| Rank 16, Absol Garbodor | none of the four | Guzma ×1 | **0%** |
| Rank 22, Absol Garbodor | Field Blower ×1 | Guzma ×1 | **14.3389%** |

*Conditional on an initial seven containing a known Basic Pokémon, with exactly one ordinary card draw on each of the next two turns. The opponent has not necessarily played the drawn card or met its effect conditions. The table gives access to any physical named removal card among their first nine observed cards, rather than a probability of successfully removing Hood or attacking around it. The seven lock-deck counts refer to complete source decks, irrespective of their probability of actually establishing a lock.

## Exact calculation

For a 60-card source deck containing `A` copies of these four Trainer names and `B` known Basic Pokémon, with `A + B <= 60`, let `V` be the event that the first seven include a Basic. Let `R` mean the initial seven plus two ordinary draws include at least one of the `A` answers. Because these answers are Trainer cards, their identity category is disjoint from Basic Pokémon.

`P(R | V) = 1 - ( [C(60-A,7) - C(60-A-B,7)] / [C(60,7) - C(60-B,7)] ) × C(53-A,2)/C(53,2)`.

The first ratio is the chance that the initial seven have a Basic but no answer, conditional on a legal Basic start. Given no answer in those seven, the second ratio is the probability that neither of the following two draws is a removal card. The positions of the six Prizes are marginalized in this nine-card sample, because the order of the unobserved 53 is uniform after the opening seven. This expression is exact for the narrowly specified observation event.

For the three Iron Thorns decks, `B=4` and `A=2,2,3`, yielding **25.89457793%, 25.89457793%, 36.48146031%** respectively. Averaging just these three differently counted source lists equally gives **29.42353873%** observed direct-answer access, which must *not* be interpreted as a matchup probability. Initial Basic conditioning matters most to lists with few Basics.

## Strategic interpretation and limitations

Hood Shield's two Stealthy Hood can sometimes protect the Benched VMAX's `Underworld Door` from `Initialization` and `Garbotoxin`, as shown in the separate pinned-engine state fixtures. The exact source inventories expose a major adversarial dependency: **all three published Iron Thorns opponents bring both Faba and Megaton Blower**, with possible gust and Tool Jammer lines besides. A pilot that models the Hood as permanently protected or the opponent as unable to search these removal cards is structurally optimistic.

This audit does *not* assume those removal cards are immediately playable. Faba consumes the Supporter for the turn; three of the four listed removals are Items affected by Item lock and other conditions, while Lost Vacuum has its own extra hand payment. Search and draw effects can substantially increase access. Opponent decisions, Bench position, alternate Tools, singleton ACE SPEC rules, prizes after taking Knock Outs, and attacking tempo can change the result in either direction.

**Next gate:** benchmark a competent opponent that explicitly recognizes a protected Benched Shadow Rider VMAX and chooses whether to devote Faba/Megaton/Field Blower to it, considering the other uses for its own search and Supporter resources. Compare against the champion and Temple candidate with the same source opponent lists, both real starting orders, validated card-effect hooks and machine-readable action traces. No win-rate claim follows from this inventory.
