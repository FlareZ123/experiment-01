# Regidrago Aichi source-list variance: shared policy core and rank-specific branches

**Agent 17 · 17 November 2026**

## Decision

The nine available Regidrago lists share a substantial source-identity core, so one reusable Regidrago decision module is plausible. However, rank 10 is not a safe stand-in for the other eight lists: relative to rank 10, the available lists differ by **9–15 card substitutions** in most cases, and rank 18 is a stronger outlier. Build a shared core only with exact rank-specific 60-card manifests and explicit variant branches.

Ranks **23 and 28** are also labeled Regidrago, but their exact lists are unavailable. Do not infer their contents from these nine lists or treat them as covered by a generic policy.

This is a source-list composition result, not a card-interaction, policy-competence, matchup, or win-rate result.

## Scope and method

Source: `results/aichi-2026/full-decklists.json`, SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`.

Included available Regidrago source ranks: **10, 12, 13, 14, 18, 20, 21, 27 and 32**. Each source list contains exactly 60 cards. Card identity is keyed by the source display name plus exact set and number; no source rows are normalized or substituted.

For two 60-card lists A and B, define the count-distance:

\[
D(A,B)=\frac{1}{2}\sum_c |n_A(c)-n_B(c)|.
\]

This is the exact number of card substitutions needed to transform one multiset into the other. The "shared identities" count below is the number of distinct source card identities present in both lists; it is not a card-copy overlap or strength score.

## Rank-10 prototype transfer distance

| Rank | Substitutions from rank 10 | Shared distinct identities with rank 10 |
|---:|---:|---:|
| 10 (prototype) | 0 | 36 |
| 12 | 14 | 26 |
| 13 | 9 | 29 |
| 14 | 12 | 28 |
| 18 | 14 | 28 |
| 20 | 12 | 28 |
| 21 | 11 | 31 |
| 27 | 13 | 28 |
| 32 | 15 | 26 |

Across all pairwise comparisons, the closest pair is ranks **12/27** at 6 substitutions; ranks **14/21** and **20/32** are each 9 substitutions apart. The largest distance is **21 substitutions** between ranks **18/32**. Rank18 is 19 substitutions from each of ranks 12, 13, 20 and 21.

Therefore, the current rank-10 prototype can provide a starting point for a common Regidrago policy core, but its rank-specific tech choices must not be copied to other source lists by default.

## Twenty source identities common to all nine lists

The following exact card identities appear in every available Regidrago list. Counts vary as shown; the fixed-copy engine core and variable counts should be separate in the rank configuration.

| Source card identity | Copies across ranks 10,12,13,14,18,20,21,27,32 | Total copies |
|---|---|---:|
| Regidrago V (SIT 135) | 4,4,4,4,3,4,3,4,4 | 34 |
| Regidrago VSTAR (SIT 136) | 3,3,3,3,3,3,3,3,3 | 27 |
| Budew (ASC 16) | 2,1,1,1,1,2,1,1,2 | 12 |
| Dragapult ex (TWM 130) | 1 each | 9 |
| Dialga-GX (UPR 100) | 1,2,1,1,1,1,1,2,1 | 11 |
| Kyurem (SFA 47) | 1 each | 9 |
| Dedenne-GX (UNB 57) | 1,1,1,1,2,2,1,1,1 | 11 |
| Tapu Lele-GX (GRI 60) | 1,1,1,1,2,1,1,1,1 | 10 |
| Latias ex (SSP 76) | 1 each | 9 |
| Guzma (BUS 115) | 2,2,2,2,3,2,2,2,2 | 19 |
| Raihan (EVS 152) | 1,2,1,2,1,1,1,1,1 | 11 |
| Quick Ball (FST 237) | 3,4,3,4,3,4,4,4,4 | 33 |
| Mysterious Treasure (FLI 113) | 3,4,4,4,4,3,4,4,3 | 33 |
| VS Seeker (PHF 109) | 3,3,3,3,2,2,3,2,2 | 23 |
| Hisuian Heavy Ball (ASR 146) | 1,1,1,1,2,1,1,1,1 | 10 |
| Super Rod (PAL 188) | 1 each | 9 |
| Muscle Band (XY 121) | 2,2,2,2,2,2,1,2,1 | 16 |
| Double Dragon Energy (ROS 97) | 4,4,3,4,4,4,3,4,4 | 34 |
| Grass Energy (MEE 9) | 4,4,4,4,2,4,4,4,4 | 34 |
| Fire Energy (MEE 10) | 2,2,3,2,2,2,3,2,2 | 20 |

Seven further identities occur in at least seven of the nine lists but are not universal: Crispin (8 lists), Marnie (8), Ultra Ball (7), Battle Compressor (7), Marshadow (7), Parallel City (7), and Noivern ex (7). These should be treated as common variant modules, not assumed universal requirements.

## Low-prevalence branches that require rank-specific configuration

| Rank | Distinctive or low-prevalence source-list cards |
|---:|---|
| 10 | Faba; Wobbuffet (also rank 21); Battle VIP Pass ×3 (also ranks 13 and 18); Prime Catcher (also ranks 18 and 27) |
| 12 | Fezandipiti ex (also rank 32); Echoing Horn (also ranks 13 and 27); Crobat V; Megaton Blower; Path to the Peak |
| 13 | Battle Compressor ×2; Salamence ex; Silent Lab (also rank 32); Koraidon ex; Megaton Blower |
| 14 | Mega Dragonite ex (also ranks 20 and 32); Oricorio-GX; Sudowoodo (also rank 18); Sky Field (also rank 18) |
| 18 | Sky Field ×3; Mega Kangaskhan ex; Pokémon Ranger (also rank 32); Battle VIP Pass ×4; Regidrago V ×3; Grass Energy ×2 |
| 20 | Mega Dragonite ex; Team Yell Grunt; Nest Ball; Path to the Peak; Professor Sycamore ×2 |
| 21 | Wobbuffet; Crispin ×2; N; Counter Catcher; Path to the Peak |
| 27 | Eldegoss V; Net Ball; Echoing Horn; Prime Catcher |
| 32 | Mega Dragonite ex; Silent Lab; Pokémon Ranger; Cynthia & Caitlin; Stealthy Hood |

This table is deliberately descriptive. It does not claim that any listed card is strategically important or that the source policy should always play it. It identifies branches that a generic rank-10 policy could otherwise fail to recognize.

## Policy-panel implications

1. **Keep one reusable Regidrago core, not one rank-10 clone.** Common decision logic may be shared, but every opponent policy must bind the exact 60-card source manifest and use the correct card counts.
2. **Add variant tests for the outliers.** Rank 18's Sky Field ×3 / Mega Kangaskhan configuration, rank 13's Salamence/Battle Compressor branch, rank 27's Eldegoss/Net Ball branch, and rank 32's Mega Dragonite / Silent Lab / Stealthy Hood package should each have source-specific competence witnesses before the policy is considered rank-ready.
3. **Preserve the rank-10 prototype as one member of the family.** Its Faba, Wobbuffet and Battle VIP Pass package is not a family-wide default.
4. **Keep ranks 23 and 28 blocked.** Their Regidrago archetype labels are not 60-card lists. No family coverage or full-field aggregation can include them until exact lists are recovered.
5. **Do not use list similarity as a competence score.** A policy's ability to execute a common core does not prove that it handles each rank's unique cards, counters, or endgame.
6. **Sequence after the current V3 gate and first trace.** This analysis does not authorize a new worker, policy bundle, fixture, game, seed, or candidate change.

## Reproduction

The count-distance and common/rare identity tables are direct calculations over the nine source rows in `results/aichi-2026/full-decklists.json`. For each rank pair, compute the L1 difference over exact `name + set + number` keys and divide by two. Common identities are the intersection of the nine nonzero-card key sets. The source JSON remains unchanged.

**Evidence classification:** exact source deck counts and printing identities = repository data; distance/intersection tables = deterministic arithmetic; shared-policy design = proposed methodology; card effects, policy competence and matchup strength = not tested here.
