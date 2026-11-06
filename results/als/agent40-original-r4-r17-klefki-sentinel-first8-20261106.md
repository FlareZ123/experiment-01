# Original ranks 4 and 17: authenticated Klefki openings against Sentinel's Fan Rotom and Hood resource window

**Agent40 | 6 November 2026 | Fixed original sources and fixed candidate, exact independent physical-deal mathematics. Not a policy, native run or win-rate estimate.**

## Upgrade from missing-source rank25 hypothesis to authenticated original competitors

The [full Aichi Top32 manifest](../aichi-2026/full-decklists.json) independently authenticates original **rank4 Raichu/Electrode Combo** and **rank17 Raichu/Electrode Combo**, each with **one Klefki SVI96** among exactly **13 Basic Pokémon** (12 other Basics). These are actual original source sixties, unlike rank25's missing original. Each complete printed list remains unchanged. The fixed [Sentinel Lopunny/Vileplume v1](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json) has **14 Basics**, including one **Fan Rotom SCR118**, plus **three Stealthy Hood UNB186**.

The printed/pinned [Klefki SVI96 Mischievous Lock](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/klefki.ts) applies from the **Active Spot**, removing the Abilities of Basic Pokémon in play, with itself exempt. If one source gets Active Klefki while Sentinel is still setting up, it can suppress Fan Rotom's **first-turn Fan Call**, unless a Tool or another legitimate protection changes this. Klefki alone does not remove Bunnelby PRC121's **Ω Barrage Ancient Trait**, and does not intrinsically suppress the already evolved Vileplume or Pidgeot ex Abilities. [Sentinel Basic and evolution surface](agent40-klefki-candidate-ability-surface-original-rank25-20261106.md) documents those distinct rules.

## Exact separate-source opening7 and candidate opening7 + natural draw

All denominators condition the relevant player on a **Basic-valid seven-card opening** from a freshly uniformly shuffled 60, without any extra mulligan-compensation cards or voluntary actions. There are six later hidden Prizes, but since all events are confined to the first seven/eight positions, their identities sum out combinatorially. Independent source and candidate decks are shuffled independently.

**Rank4 and rank17 source event** (each b=13 Basics, k=1 Klefki):

\[
D_S=\mathrm C(60,7)-\mathrm C(47,7)=323{,}315{,}421.
\]

A source opening seven **contains** Klefki in \(\mathrm C(59,6)=45{,}057{,}474\) valid hands. It is the **only Basic available** in \(\mathrm C(48,7)-\mathrm C(47,7)=10{,}737{,}573\) valid hands.

**Sentinel candidate event** (b=14 Basics, one Fan Rotom Basic, three Hood Tools; seven opener plus one normal draw):

\[
D_C=[\mathrm C(60,7)-\mathrm C(46,7)]\,\mathrm C(53,1)
=17{,}632{,}158{,}720.
\]

Fan Rotom occurs in these first eight via either the opening seven, or the eighth natural card after another Basic made the opener legal. The exact numerator is

\[
N_{F8}=\mathrm C(59,6)\mathrm C(53,1)
+[\mathrm C(59,7)-\mathrm C(46,7)].
\]

If additionally **no Stealthy Hood is among the candidate's first eight**, the exact numerator is

\[
N_{F8,\neg H8}
=\mathrm C(56,6)\mathrm C(50,1)
+[\mathrm C(56,7)-\mathrm C(43,7)].
\]

| Exactly defined paper resource event | Favorable physical allocations | Conditional probability |
| --- | ---: | ---: |
| Rank4 / rank17: Klefki is available in Basic-valid opening seven | 45,057,474 / 323,315,421 | **13.9360732812%** |
| Rank4 / rank17: Klefki is the only opening Basic, so initial Active is forced Klefki | 10,737,573 / 323,315,421 | **3.3210828505%** |
| Sentinel: Fan Rotom naturally seen by first eight | 2,675,670,888 / 17,632,158,720 | **15.1749478353%** |
| Sentinel: Fan Rotom seen by first eight, no Hood naturally seen in those eight | 1,823,115,086 / 17,632,158,720 | **10.3397157146%** |
| Independent **joint** source forced initial Klefki and candidate Fan Rotom first8 with no Hood first8 | Product of the two fractions above | **0.3433905254%** |
| Independent **joint** source Klefki available initial7 and candidate Fan Rotom first8 with no Hood first8 | Product of two source/candidate fractions | **1.4409503591%** |

The two original-source ranks have identical values because they have the same one-copy Klefki and 13-Basic census. The joint events are **resource-collision screens**, without any assertion that the source Active remains Klefki, the candidate would have used Fan Call, the candidate cannot search Hood through other resources, or that either player wins or loses. Candidate's actual Supporter/Item access, Tool opportunity costs, Source Item lock, Artazon, evolution lines, opponent first-turn choice, opponent mulligan compensation, switches, and player decision policies remain outside this model.

## Validation and experimental provenance

The exact expressions were calculated with independent Python integer binomial coefficients, then the candidate target/no-Hood and source forced/available formulas were coded in [source-locked CommonJS](../../simulation/evaluation/agent40-original-r4-r17-klefki-sentinel-first8.cjs). The [pure unit tests](../../tests/agent40-original-r4-r17-klefki-sentinel-first8.test.cjs) assert the full exact integers and independently exhaust tiny physical decks, including a six-card toy with one Fan target, one other Basic, one Hood, and three other cards, where the mathematical \((D,N_F,N_{F,\neg H})\) is **(36,24,15)**. The Python arithmetic independently verified all published values. The CJS files are committed, **but the Node test has not been run**, and no compiled native actions or matches occurred in this analysis.

## Practical use

These are two **authentic field opponents** for the early-Klefki source-owner policy frontier. A useful controlled next game-state test would choose source rank4 or17 from its **original physically shuffled 60**, conserve actual Prize and non-Basic starters, then compare candidate Fan Rotom's Fan Call in source Klefki Active versus a matched source Active without the lock, while checking legal Hood attachments and alternative Artazon/Tool lines. Carry both seats, real attempted roots, legal source responses and contested evolution setup into the shared bilateral policy. Do not call a Klefki-in-opening probability a realized Klefki-Active probability at Sentinel's setup turn.

Rank25's public firsthand Klefki strategy remains an **independent qualitative lead**. With its original exact 60 missing, it is not an authenticated third occurrence in the source field.

**Benchmark unchanged:** original printed source 60s 29/32, missing 23/25/28; no selected final 60; no competitively qualified games; 99.5% win rate unproven.
