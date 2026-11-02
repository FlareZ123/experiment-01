# Original Aichi 2026 60-card within-archetype diversity

**Agent 5 | 2 November 2026 | reproducible inventory analysis, not game outcome evidence**

## Relationship to existing research and consolidation

**Repository-context correction (2 November):** [Agent 21's prior original-field diversity analysis](agent21-field-diversity-coverage.md) already established the same name/printing replacement metric, stronger printed-distance exact k-center results and priority for distinct Snorlax/Raichu source drivers on **19 October**. This report is an **independent same-roster replication and Node CI verification** of selected name-level distances; do not cite it as discovery of a previously unknown repository-wide phenomenon. The existing [Agent 21 canonical analyzer](../../scripts/aichi-field-list-coverage.cjs) and [test suite](../../tests/aichi-field-list-coverage.test.cjs) supersede the duplicated standalone script for future maintenance, and passed [manual Node CI 41374655246](https://github.com/FlareZ123/experiment-01/actions/runs/41374655246). The separate Agent 21 [mixed-printing census](agent21-mixed-original-printing-census-20261102.md) now also has independently compiled [Node CI 41374655246](https://github.com/FlareZ123/experiment-01/actions/runs/41374655246), including ambiguous PTCGO set-code handling. Our redundant same-printing resolver/test was retired. This correction narrows the distinctive contribution to **independent executable cross-validation and CI integration**.

## Question

Can one functional source driver trained on a single original 60 legitimately represent all original decks sharing the same published archetype label in the Aichi Open League 2026 Top 32? The shared [1 November Critic field-coverage review](../../communications/broadcast/20261101T1803Z_critic_sample_coverage_and_nightwatch_decision_veto.md) showed that nine frozen scout ranks represent only five of the 14 published source archetypes, but explicitly left **within-archetype diversity** unaddressed. This report measures the authenticated same-label differences before assuming driver transferability.

## Source and exact method

Source: [authenticated 29 original 60s](full-decklists.json), printed card counts and original rank, dated Aichi 2026 May 10, 29 of 32. Missing complete original ranks **23, 25, 28** are **excluded**.

Reproduce with the no-network [CJS analyzer](../../scripts/aichi-original-archetype-diversity.cjs) and [synthetic and roster regressions](../../tests/aichi-original-archetype-diversity.test.cjs). The tests passed in the existing [manually dispatched original-field Energy census](https://github.com/FlareZ123/experiment-01/actions/runs/41373906358), head `0a8cf04766edad2792d24b2f12a37ba29e425eed`. The first CI run [failed](https://github.com/FlareZ123/experiment-01/actions/runs/41373789128) because the exploratory one-entry-per-name calculation erroneously overwrote rank22's split-printing Trubbish; the corrected accumulated-count test and explicit synthetic duplicate-name regression passed the second run. Preserve this failure as a warning against naive `Map(name,count)` overwrites. The analyzer verifies that each source sums to exactly 60 and groups by the *published archetype label*. For two lists A and B, let a(c) and b(c) be the number of copies of card name c. It computes

```text
shared-by-name = sum over card names c of min(a(c), b(c))
name-level replacements = 60 - shared-by-name
```

It also computes a strictly printing-aware variant with key (card name, set, number, language). A "replacement" is one removed copy and one added copy, counted once. Two differently printed cards of the same name may have different attacks or Abilities. Consequently **name-level similarity is an optimistic upper bound on actual printing-specific similarity**. Even printing distance remains only an inventory metric, not a play-policy or matchup-performance distance.

## All repeated published archetype labels

| Published source archetype | Original ranks | Same-label pairs | Name-level replacements, min..max | Largest divergence pair |
| --- | --- | ---: | ---: | --- |
| Regidrago | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 36 | 6..21 | 18 vs 32 (21) |
| Absol Garbodor | 8, 11, 16, 22 | 6 | 7..26 | 11 vs 22 (26; printing-aware 27) |
| Iron Thorns | 6, 24, 29 | 3 | 5..18 | 24 vs 29 (18) |
| Snorlax Stall | 3, 7 | 1 | 34 | 3 vs 7 (34) |
| Raichu Electrode Combo | 4, 17 | 1 | 20 | 4 vs 17 (20; printing-aware 21) |

**Coverage: 29 original 60s, 14 distinct published archetype labels, 47 unordered original-deck pairs within identical labels.** Rank22 contains two different Trubbish printings under the same name. The canonical analyzer **adds** duplicate-name counts before matching: using a raw name-to-count map that overwrites the first printing would falsely report Absol's range as 8..27 instead of 7..26. The other nine labels each have one authenticated 60, so no within-label comparison is possible. Regidrago's closest same-label pair is ranks 12 vs 27 at **6** name-level substitutions.

## Why these discrepancies can change source-player decisions

**Snorlax Stall (34 of 60 replacement slots, ranks 3 vs 7).** Rank3 has **4 Plumeria, 4 Arven, 2 Galarian Stunfisk, 1 Bunnelby, 1 Rotom V, 1 Scoop Up Cyclone** and three separate original Stadium entries Tropical Beach, Player's Ceremony, Temple of Sinnoh. Rank7 has **4 Steven's Resolve, 3 Wobbuffet, 3 Mimikyu, 3 Palace Book, 2 Robo Substitute, 1 Megaton Blower** and **2 Chaotic Swell**. These are facts about the published inventories. A source policy hard-coded around Arven/Plumeria availability, Bunnelby milling, or a particular ACE SPEC cannot be presumed to activate the rank7 list's Steven's Resolve/Wobbuffet/Palace Book lines.

**Absol Garbodor (26 name-level replacements, ranks 11 vs 22; 27 printing-aware).** Rank11 contains **2 Oranguru V, 3 Carmine, 4 Professor's Letter, 2 Boost Shake, 2 Shopping Center, 8 Darkness Energy**. Rank22 instead has **2 Vikavolt V, 1 Budew, 3 Lightning Energy, 2 Battle Compressor, 2 Night Stretcher**, and no Oranguru V, Professor's Letter or Shopping Center. Both use the same label but could present substantially different lock and attacking windows. Any claim of transfer needs owner-visible native evidence in each original 60.

**Raichu Electrode Combo (20 replacements, ranks 4 vs 17; 21 printing-specific).** Rank4 includes **2 Dedenne-GX, 2 Crobat V, 4 Quick Ball, 3 Sky Field and 1 Forest Seal Stone**. Rank17 instead has **4 Unown, 4 Battle VIP Pass, 4 Rescue Carrier, 1 PokéStop, 1 Marshadow**. Both share a substantial Electrode/Raichu Energy core. Printed package divergence means a single generic turbo-draw rule may make different action choices.

**Iron Thorns and Regidrago.** Rank6/29 Thorns are comparatively similar at five substitutions, whereas rank24/29 diverge by 18. Regidrago ranks18/32 diverge by 21 and include differing Dragon payloads, Trainers and stadiums; 12/27 diverge by only six. Treat each original 60 and its actual printed response options separately until evidence supports policy reuse.

## Implications and falsification protocol

1. **The 14-archetype driver milestone is only a first coverage gate.** It gives no guarantee that 29 distinct original 60s receive the same level of source-action competence. A list with a 34-card substitution difference plausibly requires a different decision profile, although the exact performance effect is unmeasured.
2. When extending the existing canonical bilateral runner, **record source rank, original printing-60 SHA, all early hand-visible offered roots, native accepted actions, prompt payments and first meaningful pressure/response**. Report actual policy differences for repeated labels. Do not infer a deck's legal actions from its archetype label or another list's cards.
3. A useful source-driver transfer test is to freeze one policy, exercise it on rank3 and rank7 Snorlax with actual original printings, and verify both can perform their characteristic hand-visible set-up and denial/mill actions when legally offered. If it cannot, split or extend the shared action modules without changing the fixed candidate 60s.
4. Preserve current sampled outcomes and attempt denominators; no additional games or wins are implied by a deterministic list-distance census. Evidence status remains 29/32 exact originals, **zero competitively qualified games** and **no demonstrated 99.5%**.

**Limitations:** inventory differences are not independent observations of gameplay; paper legality and print-specific implementations remain separate validation tasks. Some cards could be functionally interchangeable despite differing names, and small name distance does not certify same native text or role. No matchup has been simulated in this investigation.
