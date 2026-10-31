# Japanese Extra banlist: misleading name-only collisions in the Aichi source field

**Agent 5 · 31 October 2026 · official-rule / exact-printing source audit.** This note identifies a concrete deck-construction pitfall without declaring complete legality of 29 original Japanese inventories or any hypothetical candidate 60.

## Governing source and scope

The Pokémon Card Game official Japanese [regulation page](https://www.pokemon-card.com/rules/regulation/index.html), **Extra (エクストラ) section, updated 19 February 2026**, permits the BW series onward and enumerates banned cards. Crucially, some Pokémon bans specify a Japanese set, particular Ability, or both. For example, Unown with the SM8 DAMAGE/HAND Abilities, Duskull SM11a, Marshadow with the Let Loose Ability, and BW4 Sableye are individually characterized. The official [Unown DAMAGE record](https://www.pokemon-card.com/card-search/details.php/card/35333/regu/all), [Duskull SM11a record](https://www.pokemon-card.com/card-search/details.php/card/36927/regu/all), and [BW4 Sableye record](https://www.pokemon-card.com/card-search/details.php/card/27803/regu/BW) independently show the printed identity and defining text. Other bans include name-level Trainer restrictions and particular Pokémon printings; no inference here is based on a U.S. Expanded banlist.

The registered Aichi English-display source corpus is [`results/aichi-2026/full-decklists.json`](full-decklists.json): **29 of 32** published original sixty-card lists, still missing final ranks **23, 25 and 28**. English card pool is the provided local `resources/cards/en/` mirror. These English printings are research identifiers; final official event legality requires the original Japanese printings, allowed equivalents/reprints, official print history, and event-specific rules.

## Four exact printing distinctions

| Apparent banned name | Actually present in authenticated source 60s | English printed behavior / distinction | Why a name-only ban is wrong |
| --- | --- | --- | --- |
| Unown (SM8 DAMAGE/HAND) | **18 × Unown AOR 30**, five ranks 9,17,26,30,31 | `xy7-30`, Ability **Farewell Letter**, discard this Benched Unown to draw one | The banned alternate-win DAMAGE/HAND Unown have different identity and Ability |
| Marshadow (Let Loose) | **10 × Marshadow UNB 81**, ranks 1,10,12,14,17,18,19,20,21,27 | `sm10-81`, Ability **Resetting Hole**, discard Stadium and itself | The banned disruptive hand-reset Marshadow has a different printed Ability |
| Duskull SM11a | **3 × Duskull PRE 35**, rank31 | `sv8pt5-35`, attack **Come and Get You**, retrieves up to 3 Duskull from discard to Bench | Banned Japanese SM11a Duskull has **ひとだましんか** (evolve by discard 3) Ability; printed PRE is a different card |
| Sableye BW4 | **1 × Sableye V SSH 120**, rank9 | `swsh1-120`, a two-Prize Basic Pokémon V with **Lode Search** and **Crazy Claws** | Banned BW4 Sableye uses Junk Hunt; Sableye V is a different Pokémon card |

The exact source corpus has **32 card copies** in these four superficial name families across 29 published 60s. A mechanical string check that bans all Pokémon sharing a banned name would reject genuine high-place original cards and erase their distinct strategic functions. This is especially material to the champion reference because **rank1 uses Resetting Hole Marshadow UNB**, and to source draw engines because five source sixties include Farewell Letter Unown.

## Fail-closed legality modeling recommendation

Store every rule entry as an **identity-and-effect predicate**: name + relevant original printing family/Ability or exact Trainer name + series/reprint equivalence. Match to the actual proposed source printing with verifiable EN↔JP provenance, and mark ambiguous aliases `unknown`. The engine's `fullName` (name plus shortened expansion) is insufficient on its own when several collector numbers in one set differ. For tournament entries with only an archetype and no published 60, keep `list-not-authenticated` and do not replace with a guessed contemporaneous archetype.

This note is a **negative-control audit** of four common false bans. It does not establish that every card in the 29 lists is legal under all Japanese Extra nuances, that every prohibited Trainer is absent from hypothetical candidate builds, or that a name+English-set proxy always denotes a legal Japanese printing. No match simulation is conducted or counted. **Competitive-qualified games remain zero, field coverage 29/32, and no candidate 99.5% field win rate is established.**
