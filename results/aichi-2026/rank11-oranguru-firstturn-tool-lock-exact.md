# Rank 11: exact Oranguru V tool-search path to turn-one Garbotoxin

**Agent 7, 18 October 2026 UTC. Evidence category: exact combinatorics plus independent shuffled-deal check.** This is an *accessibility subset* for the published Aichi rank-11 Absol/Garbodor deck. It measures potential early-board lock opportunities under a defined, unobstructed first-own-turn sequence, **not actual bot execution, a matchup win rate, or a recommendation to copy the opponent's deck**.

## Why this matters

[Agent 8's direct opening audit](absol-garbotoxin-direct-wally-opener.md) gives rank 11 a **1.938315870%** chance of directly seeing Trubbish + Float Stone + Boost Shake in the first eight, with Garbodor searchable after six Prizes, conditional on a valid Basic opener. That event ignores the deck's search connectors. [Agent 6's exact-source K1 opening audit](rank11-forest-stone-firstturn-connector-domination.md) instead identified a *real* first-turn Oranguru V Active plus two held Float Stones and Battle VIP Pass; the weak source bot equipped both Pokémon V with Float Stones, stranding Forest Seal Stone/Star Alchemy and later passing without Garbotoxin.

This report analytically quantifies a **different, narrower-by-Active but broader-by-search** access event: starting Oranguru V Active and using its Back Order to get one or both missing Tools, with Forest Seal Stone's Star Alchemy obtaining Boost Shake if that card is not already in hand. Battle VIP Pass may obtain Trubbish when necessary. Unlike a naive connectivity count, every search requirement has its own unprized card and a compatible destination Tool slot.

## Frozen source and exact event

Published [Top-32 rank-11 Wataru Yano 60](full-decklists.json), English printing display labels: Oranguru V ASR 133 **2**, Trubbish FST 168 **2**, Garbodor BKP 57 **2**, Float Stone BKT 137 **3**, Boost Shake EVS 142 **2**, Battle VIP Pass FST 225 **4**, Forest Seal Stone SIT 156 **2**; **7 other Basic Pokémon and 36 other cards**. All 60 are assigned to nine disjoint physical-card categories in [the exact script](../../scripts/rank11_oranguru_tool_lock_exact.py).

The event, **conditional on an opening seven containing at least one Basic**, requires all of the following:

1. At least one Oranguru V in the *starting seven*, deliberately selected as the Active Pokémon, without a Tool attached before its Ability. A later eighth-draw Oranguru alone cannot satisfy this start.
2. A Trubbish in the first eight, or a Battle VIP Pass in those eight and at least one Trubbish remaining in the search deck after six Prizes. An open Bench slot is maintained intentionally.
3. A Float Stone in the first eight, or at least one Float Stone still in the deck that Active Oranguru's **Back Order** can search.
4. Boost Shake in the first eight, or a searchable Boost Shake in the deck **and** access to Forest Seal Stone (already seen or remaining in the deck for Back Order). The Forest Seal Stone is attached to Tool-free Oranguru V. **Star Alchemy** searches the missing Boost Shake, spending the one-per-game VSTAR Power.
5. At least one unprized, unheld Garbodor remains in deck for Boost Shake to evolve Tool-equipped Trubbish. Boost Shake ends the player's turn.

Back Order gets **up to two Tools**, sufficient for a missing Float Stone and a missing Forest Seal Stone simultaneously. One Forest Seal Stone is attached to Oranguru V and the Float Stone to Trubbish, so their slots do not conflict. This path is considered on **rank 11's first turn going first**, before the opposing player's first turn and without a pre-existing opponent Ability/Item/Tool lock. Other parts of the rank-11 hand are deliberately unused. If Boost Shake is directly seen, there is no required Stone expenditure.

Printed or official card references: [Oranguru V, Back Order](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh10/133/); [Forest Seal Stone, Star Alchemy](https://asia.pokemon-card.com/sg/card-search/detail/3334/); [Battle VIP Pass](https://asia.pokemon-card.com/sg/card-search/detail/1964/); [Boost Shake](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh7/229/); [Garbodor BKP 57, Garbotoxin](https://www.serebii.net/card/breakpoint/057.shtml). The attached **advanced player's rulebook** governs Tool attachment, Pokémon Ability use and effects that explicitly permit evolution on a first turn. All cards are from the provided source registrations, but this calculation is not itself a Store-executed interaction test.

## Exact results

| Restricted event | Probability conditional on legal starting seven |
| --- | ---: |
| Complete Back Order + VIP + optional Star Alchemy route | **14.683897923741%** |
| Same route, requiring Trubbish already seen (no VIP needed) | **6.084009501467%** |
| Same route, requiring Boost Shake already seen (no Stone needed) | **3.103038575202%** |
| Same route, with Trubbish, Float Stone and Boost Shake all seen (no search needed for those) | **0.314279639990%** |

Unconditionally over opening-seven deals, including invalid opening hands, the complete subset is **11.417888585934%**. The exact full conditional fraction is
`11895095504671537 / 81007751255471040`.

### Counting method

Enumerate all **6,274** possible bounded compositions of the *first eight seen* physical cards among nine categories. For each composition `c`, its combinatorial multiplicity is `product_i C(n_i,c_i)`. Condition on Oranguru being in the **first seven**, which contributes `7/8` if exactly one Oranguru appears among the first eight and `1` if at least two appear.

Although six Prizes are dealt before the compulsory eighth card is drawn, card-order exchangeability allows first selecting eight card identities and then six Prizes uniformly from the other 52. For each composition, determine the disjoint *required still-searchable* categories: Garbodor in all cases; Trubbish when not held; Float Stone when not held; Boost Shake when not held; Forest Seal Stone only when Boost Shake and Stone are both unheld. The number of legal Prize subsets is calculated exactly by inclusion-exclusion:

`sum_{S subset of required} (-1)^|S| C(52 - sum_{i in S} remaining_i, 6 - sum_{i in S} remaining_i)`.

Divide the weighted event count by `8*C(60,8)*C(52,6)` and then by `1 - C(49,7)/C(60,7)`, the probability of a legal seven with rank 11's eleven Basic Pokémon. The script uses exact Python integers and `Fraction` throughout; decimal percentages are presentation only.

## Disjoint extension: Battle VIP Pass plus a one-retreat Oranguru pivot

**18 October follow-up.** The initial 14.6839% event requires Oranguru V to be in the starting seven and chosen Active. A second, **disjoint** legal line starts with one of rank 11's **seven other Basic Pokémon** Active, then uses the normal once-per-turn retreat to put Oranguru into the Active Spot and activate Back Order. The source's exact seven alternatives are Mega Absol ex ×3, Latias ex, Tapu Lele-GX, Crobat V and Squawkabilly ex, each with a printed Retreat Cost of **at most two Colorless**, so a single attached Float Stone suffices. These printed values were checked against the provided card database.

The restricted sequence is:

1. The starting seven contain another Basic **and no Oranguru V**. The first eight seen contain **Battle VIP Pass and at least one Float Stone**. If the eighth card is Oranguru, it may be Benched from hand; otherwise the Pass searches an unprized Oranguru. It also fetches Trubbish if not already held. Only one Pass is required because it can fetch up to two Basics.
2. Attach the first held Float Stone to the original Active, then perform the **one normal retreat** to Oranguru. This spends the retreat opportunity and occupies the previous Active's Tool slot.
3. Use Active Oranguru's Back Order to collect the missing second Float Stone and, when Boost Shake is not held, a missing Forest Seal Stone. At least one *second* Float Stone must be held or remain unprized in deck, and at least one Forest Seal Stone must be held or searchable when needed.
4. Attach Forest Seal Stone to Tool-free Oranguru V and use Star Alchemy to find an unprized Boost Shake if not held. Attach the second Float Stone to Trubbish, then play Boost Shake to search an unprized Garbodor, evolve it, and end the turn.

The exact enumeration imposes each of these limits, including an original non-Oranguru Basic starter, Oranguru being either the eighth draw or an unprized Pass target, an unprized Trubbish if not seen, both spent Float Stones, an unprized Garbodor and any required Stone/Shake searches. Source-player K0 Prize uncertainty is integrated as a uniform six-card allocation. It does not assume unrestricted access to the full deck before the first legal search.

| Disjoint, conditional-on-valid-seven access class | Exact rate |
| --- | ---: |
| Original Oranguru-in-opening-seven route | **14.683897923741%** |
| Additional other-Basic-start, VIP-plus-Float retreat route | **7.495507729080%** |
| **Union of the two specific legal access classes** | **22.179405652822%** |

The pivot's exact fraction is `144570053726383 / 1928755982273120`. For its first-eight category count, the number of admissible eighth-card placements is **eight** when at least two other Basics were drawn and no Oranguru was drawn, **seven** when exactly one other Basic was drawn and no Oranguru was drawn, or **one** when the only Oranguru was the eighth draw and at least one other Basic was in the first seven. These cases are disjoint from the initial Oranguru-in-seven event and allow simple exact addition. In a separate 300,000-permutation seeded category-deal check (`default_rng(20261018)`), **17,595 of 233,425 legal openings** satisfied the pivot predicate, or **7.537753%**, which is **0.78 binomial standard deviations** from the exact 7.495508%.

This extension is a constructive **potential resource route**, with more stringent upfront hand requirements than the original route: the Pass and first Float Stone must be available before Back Order and the retreat is consumed. It omits alternate ways to switch the initial Active (Escape Rope, Latias ex Skyliner), Quick Ball, Secret Box's discard-constrained search, additional draw, opposing counterplay and realistic policy tradeoffs. **22.1794% is still a restricted source opportunity rate, not a real turn-one lock execution frequency or game win rate.** The source's first-party strategy report describing frequent early lock therefore still needs action-level and matchup verification rather than treating this fraction as an empirical bound.

## Independent numerical check and reproducibility

A separate local shuffle check used **300,000** independent `numpy.random.default_rng(7168221)` permutations of the full 60-card category population. **233,143** had a Basic in their starting seven. The identical reachability predicates gave **14.796927%** for the full subset among those valid openings, versus exact **14.683898%**, a difference of **1.54 binomial standard deviations**; the no-VIP, no-Stone and all-direct variants were respectively **6.084249%, 3.161579%, 0.313970%**, each within 1.7 standard deviations of exact. This shuffled-deal check is Monte Carlo validation of the combinatorics, not actual played Pokémon TCG games.

- Exact reproducer: [`scripts/rank11_oranguru_tool_lock_exact.py`](../../scripts/rank11_oranguru_tool_lock_exact.py).
- Pure checks: [`tests/test_rank11_oranguru_tool_lock_exact.py`](../../tests/test_rank11_oranguru_tool_lock_exact.py).
- Inputs: [published source 60](full-decklists.json), rank 11, and supplied rulebook.
- [Manual Aichi opening audit CI 39083209769](https://github.com/FlareZ123/experiment-01/actions/runs/39083209769) **PASSED** at source head `d7e3560b5fd8d3fcb9e2b1a2ef0374faf9399c82`: both new Python test and exact-output steps passed in the existing manual-only workflow. The independent shuffled-deal check was performed locally and is separate from the CI pure tests.

## Strategic scope and open falsification

The result makes it inappropriate to treat rank 11's **1.94% direct-draw access** as a proxy for the full potential of its early Garbotoxin lock. It does not establish a 14.68% *executed* lock frequency. We intentionally exclude favorable additional lines through Quick Ball, Secret Box, Carmine, extra draws and mulligan bonus cards. We also exclude first-turn going-second opponent disruption, any line involving discarded or recovered pieces, interactions where Tools or Items become unplayable, and the actual policy choice between early lock and an alternative plan.

Next, combine [Agent 6's already ongoing rank-11 source first-turn explicit-action Store fork](rank11-forest-stone-firstturn-connector-domination.md) with an independent rules/policy review. Test whether the bot identifies this line without hidden-opponent information or a forced scripted play, and whether a competent Shadow Rider opponent can respond. The exact model can serve as a combinatorial oracle for source-dealt opening classifiers. **No 32-field coverage or competitive game qualification changes from this result.**
