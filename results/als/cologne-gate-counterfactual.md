# Hypothetical Canceling Cologne against Iron Thorns ex: exact opening access

**Agent 10, 15 October 2026. Evidence:** printed-card interaction, exact multivariate hypergeometric access, independent 600,000-deal uniform shuffle check. **Status:** narrow counterfactual; no proposed final decklist or measured game wins.

## Why this interaction matters

The [Aichi champion Shadow Rider list](../aichi-2026/benchmark-shadow-rider.md) has Radiant Eternatus CRZ105 and 4 Shadow Rider Calyrex VMAX. Its [direct plus Forest Seal Stone resource model](forest-seal-radiant-access.md) finds **54.6660%** two-VMAX first-turn potential with its Ability usable. In the three published Aichi Iron Thorns-only opponents (rank 6, 24, 29), active Iron Thorns ex's Initialization removes Radiant Eternatus's Climactic Gate as an available Ability. See [the source-card matchup audit](iron-thorns-suppresses-gate.md).

**Canceling Cologne ASR136** (`resources/cards/en/swsh10.json`, ID `swsh10-136`) is a legal paper Expanded Item that makes the opponent's Active Pokémon have no Abilities until the end of the current turn, including Pokémon that enter the Active Spot that turn. Playing it before Benching Radiant can suppress opposing Initialization during Radiant's mandatory entry window. Forest Seal Stone's Star Alchemy can still be used under Iron Thorns-style “have no Abilities” locks because its VSTAR Power belongs to the Tool and is made usable by the attached Pokémon V ([TPCi-derived ruling discussion](https://community.pokemon.com/en-us/discussion/comment/8557)).

**Important duration limit:** Cologne wears off at end of turn. Underworld Door on the VMAX Pokémon again becomes suppressed once Initialization resumes, absent an additional protection/removal mechanism. Consequently, this setup opportunity has no established relationship to winning the whole matchup.

## Defined one-card counterfactual

Modify the published champion's 60 by replacing **one unrelated non-Basic card** with **1 Canceling Cologne**. We do not identify a specific cut because replacing a valuable singleton or search connector could change deck strength in ways beyond this access calculation.

Ten disjoint card categories: 1 Radiant Eternatus, 5 direct search Items (4 Mysterious Treasure + 1 Quick Ball), 1 Hisuian Heavy Ball, 4 Shadow Rider VMAX, 10 other Basics, 3 Shadow Rider V, 1 Forest Seal Stone, 4 Fog Crystal, **1 Cologne**, 30 unrelated cards.

Condition on a legal seven-card opening with at least one of the 14 Basics. Place six uniform Prize cards, then take the mandatory first-turn draw for **either seat**. With an opposing Active Iron Thorns ex and no other locks, Cologne plus Gate is directly accessible through one of three **mutually exclusive** channels:

1. Cologne in the early hand, plus Radiant already in hand, retrievable with Mysterious Treasure/Quick Ball from deck, or recoverable from Prizes by Hisuian Heavy Ball in hand.
2. Cologne in the early hand, with Forest Seal Stone and usable Shadow Rider V (in hand or from Fog Crystal) searching Radiant from deck, or searching Heavy Ball from deck to rescue a prized Radiant.
3. Cologne in deck, Forest Seal Stone with a usable Shadow Rider V searches Cologne, and Radiant is accessible independently through the first channel's direct resources.

A Radiant forced to start Active cannot activate Climactic Gate through these lines. A prized Cologne cannot be reached by the included direct resources. A single Star Alchemy cannot simultaneously obtain two missing pieces. Search discards are optimistically assumed payable. For two-VMAX readiness, at least two VMAX must remain in draw deck.

## Exact probability results

| Event conditional on valid opener | Probability |
| --- | ---: |
| Cologne in early hand, direct Radiant access | 6.0478% |
| Cologne in early hand, FSS searches Radiant / Heavy Ball | 0.4729% |
| FSS searches Cologne, direct Radiant independently | 2.9046% |
| **Cologne plus Radiant potential** | **9.4253%** |
| **Cologne plus Gate with at least two VMAX in deck** | **9.2076%** |

The published deck **without Cologne** has no equivalent in-list effect to suppress an unsuppressed opposing Active Initialization during the Climactic Gate trigger. In that locked game state the Gate remains unavailable. The 9.2076% is the incremental early-turn **resource-state potential** attributable to this isolated hypothetical tech, under all of the stated constraints. It is not a match win-rate improvement or guaranteed activation rate.

## Reproduction

- [BigInt exact enumerator](../../scripts/aichi_cologne_gate_model.cjs) distributes opening, first draw and Prize counts over the ten groups, respecting contention between two uses of the singleton Forest Seal Stone. Its normalized exact integer denominator for valid opening states is `358964655944294400`; access numerator `33833666925378714`; two-VMAX numerator `33051976766639406`.
- [Independent 600,000-deal shuffle regression](../../tests/aichi_cologne_gate_model.test.cjs) classifies route availability directly from physical card permutations, without calling the exact enumerator's classifier. It found **9.4002%** Cologne+Radiant access, **9.1856%** two-VMAX availability, consistent with the exact results. Fixed seed `34195076`; asserts within 0.2 percentage points.
- [Manual-only CI workflow](../../.github/workflows/radiant-gate-model.yml) keeps runs reproducible without spending Actions minutes on every research commit.

## Decision status

This is a **plausible counter-tech hypothesis**, not a 60-card optimized recommendation. It does not identify the card removed or account for what the original card would have accomplished in 29 other published matchups. It also omits opponent mulligan bonuses, draw Supporters, deck refresh, alternate search connectors, bench contention, Item lock, protected discard costs, Star Alchemy opportunity cost, and opponent responses. The returning Iron Thorns lock may severely limit the value of placing two VMAX without their Energy acceleration.

A useful next experiment is a paired-seat actual Aichi Iron Thorns source-list simulation with a fixed champion list and one precisely specified Cologne variant, requiring correct Initialization, Gate, and Forest Seal Stone effect implementations before judging games. A Stealthy Hood on an already established VMAX may solve a different long-term acceleration problem; under ordinary rules it cannot be attached to Radiant before its immediate hand-to-Bench Ability window.
