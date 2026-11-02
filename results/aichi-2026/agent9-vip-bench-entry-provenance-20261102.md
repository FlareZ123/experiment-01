# Battle VIP Pass owner-deck entry provenance: four hand-only Abilities across 14 original source decks

**Agent 9 | 2 November 2026 | 29 authenticated Aichi original 60s | printed-text and native-mechanism cross-check**

## Question and result

First-turn Battle VIP Pass searches for Basic Pokémon from the deck and places them directly on the Bench. Four common support Pokémon have Abilities that specifically require **playing that Pokémon from the hand onto the Bench**. Their printed Ability trigger is unavailable when they arrive through Battle VIP Pass.

Among 29 authenticated original Aichi printed sixties, **15 contain Battle VIP Pass** and **14 of those 15** contain at least one of these four printings. Across those 15 distinct lists there are **39 physical card copies** with such a hand-play-only Bench Ability, alongside **42 total Battle VIP Pass copies**. These are decklist counts, not actual VIP searches, placements, missed activations or game samples. The sole VIP-bearing source with zero such printings is rank **17**.

| Original printed Basic | Ability | Relevant printed requirement |
| --- | --- | --- |
| Dedenne-GX UNB 57 | Dedechange | Played from hand onto own Bench |
| Crobat V DAA 104 | Dark Asset | Played from hand onto own Bench |
| Tapu Lele-GX GRI 60 | Wonder Tag | Played from hand onto own Bench |
| Eldegoss V RCL 19 | Happy Match | Played from hand onto own Bench |

This is a **specific Ability-trigger exclusion** and does not prove that those Pokémon are poor VIP targets: they have their own attacks, recovery and game-plan functions, and different Prize liabilities. Ability locks remain separate conditions.

**Important negative control:** Squawkabilly ex PAL 169's Squawk and Seize Ability is an optional first-turn use and does not specify being played from hand onto Bench. Its entrance through VIP does not itself block that Ability. First-turn status, prior use, other restrictions and Ability lock still matter. Treating every support Ability as a hand-entry trigger would be wrong.

The supplied Advanced Player's Rulebook sections I.H and II.E-06 distinguish deck searching/direct Bench placement from playing Basics from hand. The exact English card text for the four printings appears in the supplied card archive.

## Genuine rank-9 owner-search counterexample, already followed up

Agent 10's [original rank-9 first-turn VIP-before-attack witness](agent10-rank9-firstturn-vip-before-attack-20261101.md) used Agent9's generic owner-only VIP selector to place **Toedscool PAR and Dedenne GX UNB** directly from the original owner's deck onto the Bench. Original pinned Store physically moved two cards (**deck 46 to 44, Bench 0 to 2**), and original Voltorb still attacked that turn. This placement could not trigger Dedechange's from-hand entrance condition. It does not establish an engine violation, but it is evidence that an action-selection model must distinguish entry methods.

Agent 10 **already resolved the narrow rank-9 search-target problem** with a specialized native original-owner-only selection of Toedscool + Mega Absol ex and [four-arm same-deal tests](agent10-rank9-mega-absol-early-vip-target-20261101.md). Another rank-9-specific selector would duplicate that result. Those native developmental arms do not constitute competitive win samples.

## Exact source counts

| Rank | VIP copies | Hand-only trigger copies |
| --- | ---: | ---: |
| 4 | 1 | 6 |
| 5 | 3 | 2 |
| 8 | 2 | 3 |
| 9 | 4 | 1 |
| 10 | 3 | 2 |
| 11 | 4 | 2 |
| 13 | 3 | 2 |
| 16 | 2 | 4 |
| 17 | 4 | 0 |
| 18 | 4 | 4 |
| 19 | 2 | 4 |
| 22 | 2 | 3 |
| 26 | 3 | 2 |
| 30 | 3 | 3 |
| 31 | 2 | 1 |
| **Totals** | **42** | **39** |

The source is [the authenticated 29-deck source](full-decklists.json); original printed 60s for ranks 23, 25 and 28 remain unavailable, so this is not a complete-32 statistic. No inference about actual play frequency is made from deck counts.

## Reproducibility and proposed canonical integration

- [Source and printing-specific entry classification](../../scripts/agent9-vip-bench-entry-provenance.cjs) returns unknown for unexamined printings and separates the hand-entry condition from all other Ability requirements.
- [Five pure source and card-trigger tests](../../tests/agent9-vip-bench-entry-provenance.test.cjs) cover four exact printings, both entry methods, the Squawkabilly negative control, strict printed identity, counts in all 29 original sixties, and the original rank-9 physical printing.
- Tests were registered in the existing [manually dispatched Aichi benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml). No new workflow or on-push CI trigger was created.
- When the canonical bilateral action-chain audit sees a genuine owner-authorized VIP ChooseCardsPrompt, it should preserve each physical Bench recipient's **entry provenance** and whether any claimed Ability has a compatible trigger. This is a prerequisite for judging later Ability availability, native effect fidelity, and search-target quality. A new decision policy must still be tested against competing owner search targets and source response under frozen physical deals.

## Boundaries

The result is a **paper-text and source-composition constraint**, cross-checked against an actual prior native VIP placement. It does **not** establish a superior general target policy, frequency of selecting the four printings, frequency of resulting losses, an engine bug, or any competitive win rate. The existing generic VIP selection has deliberately been left unchanged pending decision-quality tests.

**Global status unchanged:** 29/32 authenticated opponent sixties, zero competitively qualified games, no validated single fixed deck and no demonstrated 99.5% game win rate.
