# Agent37: observable end-of-turn Tool effect regression surface in the supplied card pool

**7 November 2026. Source inventory for evaluating the new KO-before-E-21 research adapter; no game-strength claims.**

I scanned the provided `card-list.zip` original `cards/en/*.json` for card records whose **supertype is Trainer**, `subtypes` include **Pokémon Tool**, and rules/text contain the literal, case-insensitive phrases `end of your turn`, `end of each turn` or `end of turn`. The scan finds **16 printed records**, of which three (`dp4-97` Amulet Coin, `dp4-99` Leftovers and `ecard1-150` Strength Charm) precede Black & White and are not native members of the stated paper Expanded scope. The other **13 printed records** are marked `expanded: Legal` in the supplied database, representing **12 distinct names**. Treat this as a **phrase-filtered, database-labeled research surface**, not an exhaustive legality verification or independently adjudicated ban/ruling index.

| Effect family and important timing | Distinct supplied printing(s) | Practical regression question |
| --- | --- | --- |
| Optional Energy attachment from discard **after your attack / at end of your turn** | Powerglass `sv6pt5-63`, `sv6pt5-97` | KO/Prize/promotion and terminal game-end before Energy-attachment prompt. The native issue and proposed adapter have already been verified. |
| Healing at end of your turn if Active | Leftovers `sv3pt5-163` | Does healing occur at the correct end-turn stage after the attack's KO/Prize? |
| Healing at end of **each** turn conditional on damage | Sitrus Berry `swsh1-182`; Emergency Jelly `swsh12-155` | Is post-turn healing evaluated only while the attached Pokémon remains in play, and is it skipped appropriately after terminal resolution? |
| Special Condition removal at end of **each** turn | Lum Berry `swsh1-168` | Does the effect trigger at both players' turn endings, before Pokémon Checkup, without changing mandatory KO/Prize ordering? |
| Conditional card draw at end of your turn after attack coin flips | Blunder Policy `swsh9-131` | Is draw conditional on a qualifying tails result? Can draw be incorrectly prompted before a winning final Prize or before mandatory KO effects? |
| Tool self-discard at end of your turn | Technical Machine: Blindside `sv4-176`; Devolution `sv4-177`; Evolution `sv4-178`; Turbo Energize `sv4-179`; Crisis Punch `sv4pt5-90`; Fluorite `sv8-188` | Are the Tool cards still in play through attack and KO processing, then sent to owner discard after a nonterminal attack or pass? |

Important selection limitations: `legalities.expanded` in the supplied database is a metadata value rather than an independent legality check; the set may omit relevant older reprints or end-turn effects expressed using other wording. A simple text filter cannot identify effects with implicit timing or effects from Stadiums, Pokémon Abilities and non-Tool cards. Some may be unsupported by the **pinned** Twinleaf implementation, requiring explicit unsupported-card receipts. Do not infer a working native card implementation from the fact that the name appears in this archive.

### Why the broader matrix matters

The successful [12-pair two-seat Powerglass A/B test](agent37-paper-ko-before-endturn-native-two-seat-20261107.md) demonstrates actual KO/Prize/promotion priority and skips Powerglass on winning terminal attacks while leaving its PassTurn activation. [Eon Blade's attack restriction](../../simulation/twinleaf/agent37-eonblade-next-turn-hook-regression.cjs) is independently preserved. The new interceptor, however, invokes the *whole* pinned `EndTurnEffect` after `checkState`. It can therefore affect all eligible end-turn card handlers, and the correct placement of card-state changes needs independent tests beyond Powerglass.

Most useful priorities for follow-up:
1. **Blunder Policy:** a potentially prompt-producing draw before vs after a KO, conditioned on actual attack coin results.
2. **Lum Berry / Sitrus Berry / Emergency Jelly:** end-of-each-turn rather than owner-only timing and conditional Tool self-discard.
3. **Technical Machines:** endturn Tool removal after printed attack and legal pass, particularly if the Pokémon survives and keeps cards attached.

For each, use a **real accepted pinned Store action** with physical card identity, both seats, source-owning player and live Prompt resolution, including an ordinary nonterminal and a win-ending KO, and preserve both baseline and adapter state before claiming paper parity. The supplied Advanced Player's Rulebook v3.4 §A-01, §D, §E, and §E-21 must govern event ordering where applicable. Avoid unrelated generalization from Powerglass.

This inventory provides next-test coverage targets for normal researchers and does not alter the collective research selection board: **29/32 original opponent inventories, zero qualified competitive games, and no demonstrated 99.5% rate.**
