# Direct Trainer Tool-removal inventory in the 29 authenticated original Aichi Top 32 decks

**Agent 1, 30 October 2026 | Exact-name printed-source inventory, computational. Potential counterplay coverage only.**

## Why this matters

The new [paired native original rank11 versus rank1 Field Blower counterexample](agent1-original-rank11-versus-rank1-fieldblower-native-counterplay-20261030.md) proves that a rank11 turn-one Tool-equipped Garbodor can survive the default opposing bot and then immediately lose the Tool when the same original opponent physically holds and *uses* one direct Trainer removal card. This raises a broader metagame question: which authenticated original opponent 60s contain *named* direct Tool-removal options that an owner-aware response policy must consider?

The deterministic [exact-name CJS census](../../simulation/evaluation/agent1-original-field-tool-removal-census.cjs) reads the repository's unchanged [29 authenticated printed final-place 60s](full-decklists.json). Its fixed, explicitly enumerated direct Tool-remover set consists of the Items `Field Blower`, `Lost Vacuum`, `Tool Scrapper`, `Startling Megaphone`, and Supporters `Faba`, `Xerosic`. It counts each exact printed name, never fuzzy-matches other Trainers; in particular `Xerosic's Machinations` is **not** counted as `Xerosic`. These are potential lines, not automatically legal moves through Item/Supporter restrictions or other active conditions.

## Reproducible source counts

<escape>14 of the 29 authenticated originals</escape> carry one or more named direct Trainer Tool-removal cards, totaling **20 printed copies** in those 29 original 60s:

| Explicit card name | Original 60s containing card | Printed copies |
| --- | ---: | ---: |
| Field Blower | 9 | 11 |
| Faba | 7 | 8 |
| Lost Vacuum | 1 | 1 |
| Tool Scrapper | 0 | 0 |
| Startling Megaphone | 0 | 0 |
| Xerosic | 0 | 0 |
| **Unique source 60s / total printed copies** | **14** | **20** |

The 14 exact original final-place ranks and copy details are:

| Rank | Archetype | Named direct Trainer removal |
| ---: | --- | --- |
| 1 | Shadow Rider Calyrex | 1 Field Blower |
| 2 | Vileplume Control | 1 Faba |
| 3 | Snorlax Stall | 1 Faba |
| 5 | Mew Genesect | 1 Field Blower, 1 Lost Vacuum |
| 6 | Iron Thorns | 1 Faba |
| 7 | Snorlax Stall | 2 Faba, 1 Field Blower |
| 8 | Absol Garbodor | 1 Field Blower |
| 10 | Regidrago | 1 Faba |
| 19 | Raging Bolt | 1 Field Blower |
| 22 | Absol Garbodor | 1 Field Blower |
| 24 | Iron Thorns | 1 Faba |
| 29 | Iron Thorns | 1 Faba, 1 Field Blower |
| 30 | Lillie's Clefairy | 3 Field Blower |
| 31 | Dusknoir Chimecho | 1 Field Blower |

These numbers are exact finite multiset counts of the six named Trainer cards in the **currently authenticated original paper 60s**. They exclude the three unavailable final-place original lists (ranks 23, 25, 28). They are **a lower bound on card families providing Tool removal**, since attacks, Abilities, Stadium effects, forced Knock Outs, Tool disabling, resource search chains, and indirect board repositioning are outside this simple scan.

## What the inventory proves, and what it does not

A pure count does not establish access, discard cost, legal target, contention, or a strong counterplay decision. `Field Blower` is an Item. `Faba` is a Supporter and may conflict with the turn's draw or energy plan. `Lost Vacuum` requires a hand card sent to the Lost Zone as a play cost. Even a singleton printed in a deck can be Prized, discarded, unavailable before the opponent's next turn, or protected from play by a different lock. No estimated first-reply probability, percentage of true broken Garbotoxin locks, game performance, or 99.5% attainment follows from this table.

The accompanying [native physical seed299 paired decision experiment](agent1-original-rank11-versus-rank1-fieldblower-native-counterplay-20261030.md) supplies the much stronger needed mechanism evidence for one of the 11 Field Blower copies: actual opponent first-root hand ownership, a legal Item response, native prompt resolution, and the public Tool removed at the next source decision. Similar owner-and-State validation is required for each other family and opponent. Treat this inventory as a **prioritization map for the common bilateral opponent chooser**, with all match outcomes unqualified.
