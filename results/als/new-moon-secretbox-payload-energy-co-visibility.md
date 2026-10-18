# New Moon Secret Box multi-axis opening: strict physical co-visibility upper screen

**Agent 1, 18 October 2026. Evidence tier: exact source-locked finite-population probabilities, independently derived from two distinct sampling orders, manual GitHub Actions regression. No played games or competitive qualification.**

## Question

The [compiled staged Secret Box copied-GX line](new-moon-secretbox-real-store-multiaxis.md) can pay its three-card Item cost by discarding Gengar & Mimikyu-GX, Basic Psychic Energy and a third non-Basic; search Field Blower, Powerglass, a Supporter and a Stadium; remove an opposing Garbodor Tool; then copy Horror House-GX through Mewtwo & Mew-GX and attach the discarded Basic Psychic Energy with Powerglass at end of turn.

That action path is mechanically possible on the injected board. **How often do all directly visible resource pieces for the narrowly prescribed path coexist by the first ordinary draw in a fresh, physically shuffled frozen 60?** This deliberately restrictive calculation excludes indirect search/draw chains and therefore estimates one immediate co-visibility pattern. It must not be read as the probability of the whole deck executing the strategy.

Source-fixed identity hash for [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md): a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4.

## Exact resource population

The frozen 60 partitions without overlaps as follows:

| Physical category | Count |
| --- | ---: |
| Mewtwo & Mew-GX (desired starting Active) | 2 |
| Gengar & Mimikyu-GX (Secret Box payload) | 1 |
| Secret Box | 1 |
| Basic Psychic Energy | 3 |
| Telepathic Psychic Energy | 3 |
| Field Blower | 2 |
| Powerglass | 2 |
| Other starting-eligible Basic Pokémon | 14 |
| All remaining non-Basic cards, excluding the named resources above | 32 |
| **Total** | **60** |

Split the last category into **D designated hypothetical acceptable third discard copies** plus the remaining 32-D protected non-Basic copies. Counts alone establish nothing about which cards are truly expendable. D is a sensitivity parameter, not an empirical DCI value.

Condition on at least one of the 17 Basics in the opening seven; set six random Prizes without looking; take the first ordinary draw from the remaining deck. Do not add opponent-mulligan bonus cards. The conjunctive event requires:

1. At least one Mewtwo was in the **initial seven** to be selected Active.
2. Exactly the deck's singleton Gengar and singleton Secret Box are among the first eight observed cards. Hold Gengar for the Box discard instead of committing it to Bench.
3. At least one Basic Psychic Energy can be discarded and at least one **different** Basic Psychic or Telepathic Psychic Energy remains available for an attachment. This requires at least two total Psychic-providing card copies with at least one of the Basic variety.
4. At least one of the D specifically designated non-Basic payment cards is among the first eight, so Secret Box has a third hypothetical discard beyond Gengar and reserve Basic Psychic.
5. Neither Field Blower is in the first eight, so this is an *exclusive* Box-to-Blower search channel. At least one remains unprized.
6. At least one Powerglass is directly observed among the first eight **or** at least one is unprized and searchable by Box.

This screens direct co-visibility and Prize survival. The opponent has no modeled actions or setup, and the candidate's Energy/Tool/card-use chronology is not verified by the probability itself. Strategic payment value, Bench choices and alternative Secret Box searches remain open.

## Exact results

| Third-payment candidate pool D | Chance of all strict co-visible resources, conditioned on legal opening seven |
| ---: | ---: |
| 0 | **0.000000%** |
| 6 | **0.005611%** |
| 10 | **0.008584%** |
| 14 | **0.011008%** |
| 16 | **0.012032%** |
| 32 (every other non-Basic card accepted) | **0.016631%** |

At **D=16**, this narrow co-visibility pattern occurs with probability 0.0120322801% (about one per 8,311 legal openings). Even an unrealistically permissive D=32 reaches only 0.0166305212% (about one per 6,013). These figures are probabilities of the particular conjunction, **not predicted game-win rates, matchup loss rates, or the chance of achieving the setup through draw/search later**. There are alternative routes and evolving game states that this static screen cannot count.

Exact rational results include D=6: 28498040313/507909574318055, D=10: 8719698935/101581914863611, D=14: 7987470107/72558510616865, D=16: 8730443224/72558510616865, and D=32: 889136944/5346416571769. All values arise from exact BigInt integer arithmetic before decimal display.

## Cross-implementation verification

The primary calculation enumerates unordered first-eight compositions by categories. Exactly one Mewtwo in the eight receives a **7/8** conditional placement factor for its appearance in the initial seven; two copies receive factor one. Each composition is multiplied by the six-Prize survival count. With no observed Blower, both are initially among the other 52 cards. If Powerglass is directly observed, the favorable Prize count is the total subsets minus those Prizing both Blowers. If neither Powerglass is observed, inclusion-exclusion additionally requires at least one unprized Powerglass.

An independent enumerator instead enumerates **the full legal opening seven first**, draws the eighth from the remaining **53** physical cards by category, and checks the same event with Prize survival after the draw. It never uses the eight-card placement weighting shortcut. Both independent rational formulations agree exactly at tested D=0,1,2,4,6,10,14,16,20,24,28,32. All corresponding reduced rational fractions are separately asserted. The test was corrected after the first CI attempt compared JavaScript floating approximations for exact equality: two identical reduced fractions may produce floating values differing in the final bit due to evaluation order. The final regression compares the exact rational numerator and denominator.

- [Exact source-locked script](../../scripts/new-moon-secretbox-payload-energy-window.cjs)
- [Independent enumerator and test](../../tests/new-moon-secretbox-payload-energy-window.test.cjs)
- **[Manual opening-audit CI 39140142807 succeeded](https://github.com/FlareZ123/experiment-01/actions/runs/39140142807)** at research revision b05fe30746fbe7a8c6567100a39d3941db879764. Archive [12140778465](https://github.com/FlareZ123/experiment-01/actions/runs/39140142807/artifacts/12140778465), SHA-256 2d756c23425900d0d0daa76656bb2f2cbf0e6d5240a3c33860d38a2fbda9d077, contains the JSON table. No workflow was added to ordinary commit triggers.

## Decision for 99.5% fixed-list research

The [previous cost-aware anti-Garbotoxin Box-to-Blower study](new-moon-secret-box-discardability-frontier.md) measures a much broader single-connector event: 24.37646% direct Blower and a cost-sensitive additional Box route of up to 10.01640 percentage points under frictionless assumptions. This stricter study adds *simultaneous actual attack payload, energy, protected starting attacker and Powerglass requirements*. Those additional conditions collapse the direct first-eight co-visibility frequency dramatically.

The favorable staged line has verified mechanical feasibility, but its specific natural first-eight configuration is exceptionally rare. A successful optimization must therefore rely on coherent **multi-turn search, draw, discard and recovery policy** and realistic opponent pressure. If a search path spends the critical Supporter or Blender/Compressor connector needed for attack setup, that opportunity cost can dominate nominal card accessibility.

The next test should begin with genuine source-dealt New Moon vs rank11 seeds and record the full owner-visible hand, initial Prize ignorance, first legitimate deck search and paid items, successful or missed copied-GX attacks, and replacement Tool responses. Model direct visibility and source-play outcomes separately. Do not extrapolate from this deliberately narrow screen to the complete match.

**29/32 printed Top-32 source lists remain available; ranks 23/25/28 have no exact list in the repository. Zero competitively qualified games and zero evidence of attaining 99.5%.**
