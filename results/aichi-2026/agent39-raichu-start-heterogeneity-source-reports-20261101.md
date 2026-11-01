# Agent 39: Raichu source-player start heterogeneity and direct matchup evidence

**1 November 2026 | Evidence: two self-reported actual tournament logs; no simulation.**

## Source identity

The [18 May 2026 Japanese tournament roundup](https://pokekameshi.com/cl2026aichidec-extra/) reproduces the original rank-4 **denden** player's public 10 May results and identifies the published rank-4 Alolan Raichu original 60 (deck code `LNnnHg-baOFyZ-Qgg69n`). The rank-4 player explicitly prefaced the recalled pairings `うろ覚えですが` ('from imperfect memory'). This is therefore an **approximate self-reported opponent/start chronology**, not a certified round log. The exact rank-4 60 is independently present in repository `full-decklists.json`.

The original rank-25 **kume** player's 14 May 2026 [first-person event article](https://note.com/kume_pokeca/n/n6cfd126f5774) prints all eight Swiss and the elimination result, including whether the player started first or second. The list-construction portion is paid; **rank-25 original 60 is missing**. The [separate rank25 policy report](agent39-rank25-firstperson-raichu-policy-20261101.md) records its announced counterplay intentions. The rank-4 and rank-25 logs must not be treated as independent games under one known sixty or as evidence of their respective deliberate coin-flip decisions.

## Direct counts from reported rounds

| Player / exact-source status | Reported matches | Reported first starts | Reported second starts | Overall W–L | Regidrago W–L | Regidrago first / second |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Rank 4 denden, published exact 60 | 12 | **1** | **11** | 10–2 | **6–0** | 1–0 / 5–0 |
| Rank 25 kume, original 60 missing | 9 | **5** | **4** | 7–2 | **4–1** | 3–0 / 1–1 |

Rank-4 source report opponent chronology: eight consecutive Swiss **second** starts, 7 W/1 L (loss to Shadow Rider), followed by elimination against Regidrago **first/W**, Regidrago **second/W**, control **second/W**, and Bunnelby Vileplume **second/L**. Of that player's six reported Regidrago wins, five were from second.

Rank-25 chronology: Swiss Regidrago **first/W**, Regidrago **second/W**, Lightning Toolbox **first/W**, Regidrago **second/L**, Regidrago **first/W**, Roaring Moon **second/W**, Regidrago **first/W**, ADP/Dragonite **first/W**; Top32 elimination Mega Absol/Garbodor **second/L**. Of that player's five reported Regidrago rounds, three were from first.

These are descriptive counts from two **selected successful tournament entrants**. We cannot infer their choice preference, win chances conditioned on starts, reproducible matchup strengths or relative merits of rank-4 and rank-25 card inclusions. Six wins against one opponent family are not six independent tests of a fixed deck under an identical opposing policy.

## Implications for fixed-60 benchmark design

1. **Do not hard-code a uniform Raichu 'always start second' style into the opposing archetype.** The available human observations contain materially different *realized start distributions*, though choices versus coin control are unknown. Both first and second are mandatory policy capability branches in an honest benchmark.
2. **Do not transfer rank-4 opponent decisions into rank-25 as if they were source-authenticated.** The two published original Raichu decklists (ranks 4 and 17) already differ by 20 name-level deck slots per [Agent42's proxy uncertainty calculation](agent42-missing-rank-proxy-envelope-20261101.md). Original rank25 has no published sixty. The start reports add a *policy and sampling* uncertainty on top of physical-list variation.
3. **Test concrete adverse opponents, not only Regidrago.** The two players' reported elimination defeats involve different archetypes: rank4 against Bunnelby/Vileplume and rank25 against Mega Absol/Garbodor. The rank4 Swiss loss to Shadow Rider is directly relevant to the currently nominated Shadow Rider family. Conditional selected-game outcome alone says nothing about the rate or optimal counterline.
4. **Matched prospective design:** for each authentic source rank-4 and rank-17 sixty, stratify genuinely realized starts, freeze both physical sixties and bot/engine revisions, and record actual legal first/second decisions, owner Ability locks, Benches, Item search, staged Pokémon, and attacking/Prize follow-through. Apply both-player competence and real clock gates. Label any rank-25 'opponent' with an borrowed sixty **proxy**, not original. Preserve all errors and caps.

**No field result is qualified by this observational comparison.** Baseline: **29/32 exact original 60s**, **0 competitively qualified games**, **no demonstrated 99.5% win rate**.
