# Agent 42: missing-rank proxy uncertainty from the actual published Aichi 60s

**1 November 2026 | Evidence class: deterministic, name-level source-inventory computation.** This study addresses what can be inferred about the still-unknown **23rd, 25th, and 28th original final-rank 60-card lists**. The source is the repository's `results/aichi-2026/full-decklists.json`, not any reconstructed list. No source opponent is substituted or promoted to authentic coverage.

## Reproducible metric

For two complete 60s A and B, define the **minimum same-name card substitutions** as

`d(A,B) = 60 - sum_over_card_names(min(count_A(name), count_B(name)))`.

This is the minimum number of physical deck slots that must change to match the second **card-name multiset**. It deliberately ignores printing identity, making it a possible lower bound on exact-printing substitutions. It is **not** gameplay distance, matchup distance, or a statement about how an unobserved deck was built.

Code: [source-driven calculator](../../scripts/agent42-missing-opponent-proxy-envelope.cjs); [three Node regression tests](../../tests/agent42-missing-opponent-proxy-envelope.test.cjs). Source file remains unchanged.

## Observed variation among actual source lists

| Missing original rank(s) | Confirmed archetype | Published comparison ranks | Pairwise same-name slot substitutions | Minimum across all known lists |
| --- | --- | --- | --- | --- |
| **23, 28** | Regidrago | 10, 12, 13, 14, 18, 20, 21, 27, 32 | **6 to 21**, mean **465/36 = 12.9167** across 36 pairs | **34 common copies** across the nine 60s |
| **25** | Raichu/Electrode Combo | 4 and 17 | **20** | **40 common copies** across both 60s |

The closest Regidrago published pair is ranks **12 and 27**, six same-name substitutions. The farthest is ranks **18 and 32**, **21** substitutions. Rank **12** is the name-multiset **medoid**, minimizing total distance to the other eight published Regidrago lists at **93** substitutions. The medoid is one useful center for a sensitivity analysis and has no demonstrated special relationship to either missing player.

The published Raichu source lists at ranks **4 and 17** differ by **20 of 60** slots even though they share the same broad archetype. Rank 4 has **4 Quick Ball, 3 Sky Field, 2 Dedenne-GX and 2 Crobat V**, with **0 Unown and 0 Rescue Carrier**. Rank 17 has **4 Unown, 4 Rescue Carrier, 0 Quick Ball, 0 Sky Field, 0 Dedenne-GX, and 0 Crobat V**. Both contain 4 Battle Compressor and 4 Counter Energy, among 40 shared minimum card-name copies. These are *list construction* differences and suggest materially different setup mechanisms; no policy or match performance has been measured from them.

## Exact rank-25 first-person evidence, separate from source lists

The [rank-25 player report](https://note.com/kume_pokeca/n/n6cfd126f5774) identifies the Alolan Raichu one-shot strategy and describes an intended Klefki opening and alternatives. The freely accessible content does **not** authenticate a 60 or establish that rank 25 equals rank 4 or 17. [Agent 41's identity and archetype source audit](agent41-missing-three-opponent-archetypes-sourced-20261101.md) independently assigns rank 23 and 28 to Regidrago, and rank 25 to Raichu/Electrode Combo; it leaves all three original 60s missing.

## Actionable testing design and cautions

As an **explicitly hypothetical stress panel**, fill ranks 23 and 28 independently from the nine known Regidrago original source 60s, and rank 25 from the two known Raichu original source 60s. This creates **9 × 9 × 2 = 162 with-replacement assignments** of *proxy* deck identities. A candidate fixed 60 could be evaluated once against each distinct proxy deck, using the same two-player policy, then a field-level score could be recalculated under each assignment. Compare both adverse tail and range; preserve paired deals, source printing caveats, every failure, actual first player, and time-policy limitations. Do not claim the resulting 162 assignments are independent physical tournaments or samples from the missing players' actual decks.

The current 29 published source 60s remain the only authenticated list coverage in the registered benchmark. Named-list variation is a **minimum scenario-diversity warning**, and testing all known members is more informative than choosing a single same-archetype surrogate. The source file's own English printing IDs also require Japanese legality auditing before a real-paper certification.

**Decision:** rank-25 same-archetype borrowing is particularly hazardous because two independently published builds differ in one-third of their deck slots. Keep rank 23/25/28 unresolved. **Zero competitively qualified games, no verified winning fixed 60, and no demonstrated 99.5% win rate**.

## Verification and boundaries

The exact source JSON was read and the above 36 Regidrago and one Raichu pair distances recomputed using the GitHub-connected code executor on 1 November 2026. The new files were committed through the GitHub connector, but a full Node22 repository regression run is **not yet certified**; a separate manual GitHub Actions native dispatch was blocked by the runtime's safety check. This study contains no native games. Its assertions are designed to fail closed if the source registration changes.
