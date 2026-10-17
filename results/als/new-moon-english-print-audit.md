# New Moon Perfection: 33-slot English printing/effect equivalence audit

**Agent 10, 17 October 2026.** Status: **complete representative English-card mapping, incomplete Japanese physical-print and paper-legality audit**. This is a structurally distinct, externally published 60-card candidate to test against the Aichi 2026 Top 32; it remains an unqualified 52nd-place source reference. No competitive win rate is inferred.

## Reproducible identity

- [Photographed Japanese 60 and grid transcription](new-moon-perfection-source-60.json): 33 source rows, 19 Pokémon, 35 Trainers and 6 Energy. The May 13 2026 first-person report supplied Japanese deck code `GxxDYx-a4rD4W-a8xYxc`.
- [All 33 effect-equivalent English IDs](new-moon-english-equivalents.json): one deterministic representative English card ID for each photographed name and count, preserving grid row and column. The source remains unchanged.
- Fingerprint: `cb6334eef83b32fec5fc1a89989e1dae75f40453c02efc62da9373b29567b4be`, SHA-256 of grid-ordered UTF-8 lines `row:column|count|english_id\n`. This identifies the chosen English *equivalent* 60, **not** the actual Japanese tournament registration.
- [Regression](../../tests/new-moon-english-equivalents.test.cjs) checks all source positions and counts, type and name agreement with `resources/cards/en`, 11 exact required Ability/attack names, sole ACE SPEC, digest, and a champion comparison. It is registered only in the [manual Aichi source workflow](../../.github/workflows/aichi-deck-ingest.yml), avoiding per-commit CI.

### Ability-dependent print disambiguations

| Source quantity and card | Selected English equivalent | Required effect |
| --- | --- | --- |
| 2 Mewtwo & Mew-GX | `sm11-71` | Perfection |
| 1 Gengar & Mimikyu-GX | `sm9-53` | Horror House-GX |
| 1 Trevenant & Dusknoir-GX | `smp-SM217` | Night Watch |
| 3 Unown | `xy7-30` | Farewell Letter |
| 2 Dusclops | `sv6pt5-19` | Cursed Blast |
| 2 Duskull | `sv6pt5-18` | Come and Get You; **not** the banned SM11a variant |
| 1 Solrock | `sm7-62` | Sunbeam, increases Lunatone to 130 HP |
| 1 Lunatone | `sv3-92` | New Moon |
| 1 Klefki | `sv1-96` | Mischievous Lock |
| 1 Latias ex | `sv8-76` | Skyliner |
| 1 Galarian Articuno V | `swsh6-58` | Reconstitute |
| 1 Squawkabilly ex | `sv2-169` | Squawk and Seize |
| 3 Telepathic Psychic Energy | `me3-88` | Psychic-type Basic Pokémon search upon attachment |

For the two name mismatches in the English database, Japanese/transcribed `Battle Compressor` maps to `xy4-92` whose full English name is **Battle Compressor Team Flare Gear**, and `Trainer's Mail` maps to `xy6-92` **Trainers' Mail**. These are explicit aliases and the test checks them. The official Japanese [Telepathic Psychic Energy page](https://www.pokemon-card.com/card-search/details.php/card/49712) identifies **M3 079/080**; the [official January 23 2026 set listing](https://www.pokemon-card.com/products/index.html?dateLowerM=1&dateUpperD=25&dateUpperM=8&dateUpperY=2026&productType=expansion) places M3 before the May event. This corroborates one named Special Energy's availability without establishing all Japanese print IDs.

### What this does and does not establish

The source inventory has **one Secret Box** ACE SPEC and four or fewer of every non-Basic-Energy name. The chosen Unown has **Farewell Letter**, which differs from the banned SM8 DAMAGE/HAND Unown; the chosen Duskull is a Scarlet & Violet printing rather than the prohibited SM11a Duskull. The English database marks these as distinct. These are *necessary partial checks* against the [Japanese banned-card summary](../aichi-2026/japanese-legality.md), not a complete format audit.

Japanese exact card product numbers for the other 32 source rows remain unverified from the official deck viewer. English equivalents may not be the same artwork, edition or registered printing; the Japanese ban list may use nontrivial identity/reprint categories; English legality metadata and simulator availability are insufficient to certify Japan on 10 May 2026. Printed text may differ by errata or regional translation. A true fixed paper legal list needs each Japanese ID and appropriate rules interpretation verified. No game or tournament benchmark should silently substitute these English IDs as a proven exact Japanese registration.

## Functional distance from champion and falsifiable line

[The Aichi champion reference](../aichi-2026/benchmark-shadow-rider.md) and New Moon share **20 of 60 card slots by common English card name/count minimum**, treating Basic Psychic Energy and Psychic Energy as the same name. Therefore 40 card slots would need changing to transform one multiset into the other. The core attackers differ: the champion builds Shadow Rider VMAX Underworld Door and copied Copycat/extra-turn options, while New Moon pursues a TAG TEAM GX Perfection attack package, 4 Battle VIP Pass, 4 Rescue Carrier, 3 Farewell Letter Unown and two Dusclops self-KO enabling Ace Trainer. This is substantive engine distance, although it is no quantitative evidence of superior matchups.

The published New Moon line has real conditional costs:

1. With Mewtwo & Mew-GX attacking, a Gengar & Mimikyu-GX payload is in Bench/discard, Psychic cost is paid and an active Powerglass is attached. Perfection uses Horror House-GX; a Basic Psychic Energy already in discard becomes eligible for an **end-of-turn** Powerglass acceleration if the equipped Pokémon stays Active.
2. Duskull must have been in play long enough to evolve; Cursed Blast Dusclops self-KOs and gives the opponent a Prize. That can switch on Ace Trainer when the Prize inequality holds, subject to the one-Supporter-per-turn budget.
3. With Trevenant & Dusknoir-GX payload available and three Psychic provided, Night Watch damages and randomly returns two cards from the opponent's hand. Lunatone + Solrock + Path to the Peak aim to asymmetrically suppress opposing Rule-Box Abilities while retaining the team's own Abilities. Stadium order is critical and [the existing engine-order report](../twinleaf/new-moon-silent-lab-order-fidelity.md) is a known gate.

Failure is plausible when any starting Pokémon, Psychic Energy, discard payload, paid Item cost, Duskull, Powerglass, attacker placement, supporter, or Stadium dependency misses its window. A pinned-engine completion with a generic bot cannot demonstrate that a human can reliably assemble this sequence.

## Adversarial test matrix and integration handoff

| Actual field pressure | Fast falsification question | Relevant available evidence |
| --- | --- | --- |
| **Regidrago**, source rank 10 and other print-variable lists | Does the hand-lock beat a paid Apex Dragon attack and Megaton Blower/Stadium answer after a legal turn-one setup? | [Regidrago print diversity](../aichi-2026/agent47-regidrago-source-diversity.md); pilot's four reported Regidrago wins are observational only |
| **Iron Thorns**, rank 6 | Can it use Perfection at all under active Initialization, or deliberately attack with Gengar & Mimikyu directly while managing three Psychic? | [Source-dealt Iron Thorns line](../aichi-2026/rank6-source-dealt-guzma-hala-fork.md); pilot reports losing to this archetype |
| **Vileplume**, rank 2 | Does the opening attack precede Item and Supporter locks? Can unprized Powerglass and Trainer pieces be assembled without suppressed Items? | [Rank 2 qualification packet](../aichi-2026/qualification-packets/rank-02/README.md) |
| **Raichu/Electrode-GX**, ranks 4 and 17 | Is a TAG TEAM 3-Prize attacker or self-KO Dusclops line punished by fast Electro Rain, and can Klefki be displaced? | [Raichu resource frontier](../aichi-2026/agent46-electro-rain-energy-frontier.md); pilot reports losing to Raichu |
| **Shadow Rider**, rank 1 | Does Path/New Moon take effect before Underworld Door, and what if opponent uses Tool/Stadium removal or an alternate attacker? | [Champion reference](../aichi-2026/benchmark-shadow-rider.md) |
| **Ability/Tool lock**, other field ranks | Can the precise source list execute the line from an obstructed Active, without assuming bench/Tool/Supporter resources can all be used together? | [Lock matrix](../aichi-2026/ability-scope-matrix.md) |

**Minimum next source-replay tests:** a genuine Powerglass/Horror House end-of-turn reducer and attack-cost trace; Cursed Blast self-KO followed by a real Prize update, Ace Trainer and randomly resolved Night Watch; opposing Active Thorns/Klefki/lock fixture; same information-set hidden-Prize perturbation before K1. The [existing Night Watch correction report](../twinleaf/night-watch-random-hand-semantics.md) describes a research-side fixed reducer, yet no full-source published 60 versus all 29 resolved opponents is competitively qualified. Freeze the mapping and policies before paired seat/seed comparisons. Do not use the three still missing field lists (ranks 23/25/28) as if verified.

**Current conclusion:** this fixes a reproducibility and effect-identity gap for a truly different contender. Japanese print identity, event legality, realistic policy and independent two-seat gameplay remain explicit red gates. **Zero qualified wins; the sole nominated benchmark does not change.**
