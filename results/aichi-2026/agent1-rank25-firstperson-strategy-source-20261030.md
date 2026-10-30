# Rank-25 first-person opponent strategy: recover intent without inventing its 60

**Agent 1 | 30 October 2026 | Source class: original player's self-report, not observed gameplay or a published printed card list.** The immediate purpose is to preserve opponent decision-policy hypotheses for the full Aichi Open League Top 32 benchmark, while keeping the exact-list missingness intact.

## Original sources and identity boundary

- [Author kume's free tournament and metagame discussion, published 14 May 2026](https://note.com/kume_pokeca/n/n6cfd126f5774), titled *CL Aichi 2026 Expanded Top 32 Alolan Raichu One-Shot*. The published page is freely accessible up to its **deck construction explanation**, after which the 11,432-character and three-image continuation is a paid section. No rank-25 printed 60 was recovered from the accessible text; do not reconstruct it by assuming quantities from narrative.
- [Pokekameshi Top 32 roundup, page 2](https://pokekameshi.com/cl2026aichidec-extra/2/) explicitly pairs `kume`'s Alolan Raichu One-Shot result to the Top 32 record. [Limitless Raichu/Electrode results](https://limitlesstcg.com/decks/282/results) reports rank 25 as **Kazuki Kumegawa** on 10 May 2026. Identity association is source-derived, not verified independently from a complete deck photo.
- Current repository [field roster](field.csv) and [published-printing source collection](full-decklists.json) contain 29/32 exact 60s; ranks **23, 25, 28 are still missing**. This report adds **zero** exact opponent lists.

## What the player's account actually supports

The author self-reports **7–1 Swiss, advancing in 25th place, then a loss to Mega Absol/Garbodor in the first elimination round**. Eight Swiss pairings are explicitly listed: Regidrago in five rounds (**four wins, one loss**), Lightning Toolbox (win), Roaring Moon (win), and ADP/Dragonite (win). Those are nine retrospective, *self-reported* individual match outcomes including the elimination loss. They are **not** a sample of randomly dealt games from an unchanging match policy, do not provide a replicable win-rate estimate for rank 25, and do not imply that any simulated opponent policy is competent.

The author presents Regidrago VSTAR as the dominant anticipated archetype, initially estimating about half the field, and intentionally selected Alolan Raichu/Electrode to address Regidrago while preserving wider matchups. This 50% was a **prior belief**, not the measured Top 32 share; the actual 2026 Top 32 [Limitless field statistics](https://limitlesstcg.com/tournaments/566/statistics) list 11 Regidrago decks of 32 (34.38%). Do not retrofit the author's pre-event prior as an observed tournament statistic.

Concrete proposed matchup priorities from the accessible part of the original text, with the player's own caveats:

1. **Going first against Regidrago:** establish early Basic Ability suppression, with **Klefki** discussed as a single-card way to deny Latias ex and Tapu Lele-GX effects; the author connects this to reducing exposure to a turn-one-going-second Budew Item-lock line. Opening Klefki may also suppress the author's own Basic support Abilities, so timing is material.
2. **Going second against Regidrago:** plan responses to the opponent's Path to the Peak, Sudowoodo, or Active Wobbuffet suppression while still developing, and defend against Regidrago VSTAR's potential second-turn attacking window. The author discusses Marshadow, Wobbuffet/Klefki/Empoleon V, Escape Rope/Canceling Cologne, and different disruption or Horror House-GX counter-lines as **considered countermeasures**. These are not confirmed components of the rank-25 list.
3. **Lock tradeoffs:** the author explicitly contrasts Klefki, Wobbuffet, and fast Garbodor. Garbodor demands evolution, Tool and additional deck slots; the author discarded that direction for this design. Klefki can suppress more relevant Basic Abilities in the expected matchup but has self-interference. An autonomous policy should condition the choice on the visible board and actual own-hand actions, rather than reflexively placing Klefki Active.
4. **Resource and temporal constraints:** the author discusses selecting first-player status when available and the need to prepare for both actual player orders. These are author hypotheses, not a demonstration that the proposed lines can be executed with the as-yet-unavailable exact printed 60.

## Cross-check against the two *different*, actually published Raichu 60s

The existing exact original lists **rank 4 Shu Hosoda** and **rank 17 Yuya Yamano** each have 60 original printed cards in [full-decklists.json](full-decklists.json). Their directly counted shared tools include one **Klefki**, one **Gengar & Mimikyu-GX**, three **Escape Rope**, four **Battle Compressor**, four **Reversal Energy**, four **Counter Energy**, and four **Unit Energy LPM** per 60. Their other resource allocation differs materially, including **Battle VIP Pass: 1 at rank 4 versus 4 at rank 17**, and **Squawkabilly ex: 1 versus 2**. This shows the author's strategic vocabulary is testable against specific printed peers without conflating their physical-deck identities or imputing these counts to missing rank 25.

In particular, the fact that two *known* lists happen to contain Klefki and the author says the archetype was chosen to deploy Klefki is **insufficient evidence that rank 25 contained exactly one Klefki, used the same search chains, or carried any specific 60**.

## Policy qualification proposals

The next useful test should target the existing common two-player runner and frozen **rank-4 and rank-17 exact printings**, using owner-visible decisions only and preservation of original source first/second-player identities. A first-source-turn denominator should distinguish (a) an owner actually holding a Klefki, (b) an available Bench/Active placement and legal transition, (c) competing setup Abilities requiring that Klefki remain Benched, and (d) native accepted suppression or a genuine opponent response. A second contrast can evaluate whether the existing owner action tree recognizes appropriate Rope/Cologne mobility and GX postponement choices against a visible first-turn Regidrago/Wobbuffet/Budew threat, including genuine concessions when no legal line exists. Each actual action requires original-Store acceptance and a settled public consequence. Pure access or a held card count is inadequate.

No result here demonstrates that any variant would beat Regidrago, any kind of lock, or the full Top 32. The rank-25 full-printing source remains a missing high-value input. Do not use this report as a substitute list, simulation or win-rate evidence. The shared policy veto of **zero competitively qualified games** remains unchanged.
