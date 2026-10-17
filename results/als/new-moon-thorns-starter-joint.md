# New Moon versus Iron Thorns: starter-coupled direct resource access

**Agent 13; 17 October 2026.** Evidence: **exact multivariate opening-card combinatorics**, independently checked with a miniature exhaustive permutation oracle and seeded 200,000-trial physical-card Monte Carlo. This is neither a simulated match nor a win-rate estimate.

## Motivation

The [frozen New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md) contains two Mewtwo & Mew-GX, two Canceling Cologne, six Psychic-providing Energy cards (three Telepathic Psychic and three Basic Psychic), two Powerglass and 17 Basic Pokémon. The [prior exact source-specific marginal access study](new-moon-lockbreak-60-candidate.md#aichi-iron-thorns-specifically-optional-mulligan-bonus-draws) shows **28.4707%** direct Cologne visibility if every bonus card offered by a four-Basic Iron Thorns opponent is accepted. This is useful for Item access, but its marginal event can occur without the intended Perfection attacker in the initial Active selection.

We now ask a more constrained resource question: **when Mewtwo & Mew-GX is among the accepted seven starting cards, how often are Cologne, Energy, and Powerglass each directly visible by the first mandatory turn draw?** The Mewtwo starter requirement is fixed at initial-seven selection. All other categories may appear among the original seven, optional opponent-mulligan bonus draws, or the mandatory draw. Each resource group is disjoint and sampled without replacement.

## Exact source-anchored results

The 29-list [Aichi manifest](../aichi-2026/full-decklists.json) verifies ranks **6, 24 and 29** as four-Basic Iron Thorns ex lists. The New Moon candidate is frozen at English-equivalent identity-count SHA256 `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`. Values condition on a legal seven-card initial hand containing at least one Basic Pokémon and average over unknown Prize cards.

| Initial-seven and visible resource event | No optional bonus; first mandatory draw | Accept all optional Iron Thorns bonus draws |
| --- | ---: | ---: |
| At least one Mewtwo & Mew-GX in initial seven | **24.16299056%** | **24.16299056%** |
| **Native Gengar & Mimikyu-GX** in initial seven; at least one Energy visible | **6.97744455%** | **7.81367569%** |
| Mewtwo in initial seven; at least one Cologne visible | **5.47222511%** | **6.48414084%** |
| Above, plus at least one of six Energy cards visible | **2.75199492%** | **3.84331769%** |
| Above, plus at least one of two Powerglass visible | **0.49179649%** | **0.95335032%** |

The native Gengar & Mimikyu-GX row models its **own printed Horror House-GX** with one Psychic Energy; it does not rely on Perfection or Cologne and is therefore not disabled merely by Iron Thorns's Rule-Box Ability suppression. It is more frequent as a direct resource event than the Mewtwo+Cologne+Energy event (**7.8137% versus 3.8433% with bonuses**), but placing a three-Prize TAG TEAM in the Active Spot carries major retaliation and preservation costs. Both pathways require correctly chosen Active positions. The fourth row is especially useful for evaluating the source's proposed Mewtwo/Cologne Iron Thorns escape. The fourth row adds Powerglass as an explicit further direct-access condition; it does **not** mean Powerglass has a Basic Energy in the discard pile to attach. The copied-attack line also requires an attack payload, positioning, valid attachments and unblocked Abilities. A searched Mewtwo, Tool or counter, or a non-Perfection attacking line can work without satisfying these events. Consequently none of the percentages is an upper bound on successful play, or a probability of executing Horror House-GX.

The **6.4841%** joint Mewtwo/Cologne figure should be compared carefully with the **28.4707%** unconditioned Cologne marginal. Their difference measures missing simultaneous *natural starting attacker* access under this narrow event definition, not a total loss rate. In particular, a Mewtwo initially drawn alongside another Basic can be deliberately selected as Active, while Mewtwo acquired through later search is excluded.

## Counting method

Let `N=60`, accepted hand size `h=7`, Basic count `b=17`, and designated initial Basic attacker count `m=2`. Let the required disjoint non-Basic groups have counts `g_1,...,g_s`, such as `[2,6]` for Cologne and Energy. Let `d` cards become visible after the opening seven. Define `T_A` as the sum of group counts for subset `A` of the required groups. By inclusion-exclusion, the probability conditional on a valid initial hand is

```text
P = sum_A (-1)^|A| [
      C(N - T_A, h+d) / C(N, h+d)
    × (1 - C(N - T_A - m, h) / C(N - T_A, h))
    ] / [1 - C(N-b, h) / C(N, h)].
```

The first term enforces that every designated card in subset `A` is missing from the complete visible window. The second demands at least one of the two Mewtwo starters within the **initial seven**, even after conditioning on the missing resource subset. Each denominator is supported because the resource groups are disjoint from Basics. Random six-Prize placement is integrated through exchangeability; the observed next cards form a uniform ordered sample of the remaining 53 cards, with no additional conditional knowledge about their identities.

For the bonus case, use the existing [two-player simultaneous-mulligan process](../../scripts/aichi_bonus_draws.cjs). If `q_A` is the opponent seven-card mulligan chance, `q_B` ours, and `K` the number of optional bonus offers, then `P(K=0)=(1-q_A)/(1-q_A q_B)`, and `P(K=k)=(1-q_A)(1-q_B)q_A^k/(1-q_A q_B)` for `k>=1`. Apply the direct event with `d=min(K+1,47)`, weighting each `K` and pooling the `K>=47` tail with the existing helper. Extreme draws are an approximation to **visibility** and are inappropriate for normal gameplay; the tail probability is negligible for the displayed precision.

## Reproduction and independent checks

- [Calculator](../../scripts/new-moon-thorns-starter-joint.cjs) reads the immutable English-proxy candidate and original source field, checks two Mewtwo / two Cologne / six Energy / two Powerglass and all three opponent four-Basic lists, then emits the measured events. It reuses the shared bonus-offer distribution.
- [Single runnable Node test](../../tests/new-moon-thorns-starter-joint.test.cjs) checks eight source-anchored numeric anchors to 1e-12, a zero-counter invariant, and an exhaustive independently coded seven-card toy-deck permutation oracle.
- Independent Python `math.comb` inclusion-exclusion reproduced the same values. A seeded 200,000-valid-hand Monte Carlo, shuffling a physical 60-card inventory, reserving six random Prizes and drawing first-turn and optional bonus cards, gave approximately **6.465%** Mewtwo+Cologne, **3.823%** Mewtwo+Cologne+Energy, and **0.9165%** with Powerglass. These are within ordinary sampling error of the exact model. Node local tests passed; compiled GitHub CI qualification is reported separately if and when run.

## Concrete next policy experiment

In an **unchanged source-dealt rank-6 or rank-29 game**, record whether Mewtwo can be promoted, whether Cologne is actually playable after the opponent's setup, whether Telepathic Psychic/Basic Psychic can be legally attached, whether the Gengar & Mimikyu-GX payload is accessible in Bench/discard, and the opponent's genuine next action. Compare against the **native Gengar & Mimikyu-GX attacker line, with its larger direct-access opportunity but three-Prize exposure** and early Secret Box/Battle Compressor routing; record sacrificed search and recovery opportunities. Prefer falsification of an exact decision to more marginal probability tables.

**Interpretation:** Joint resource exposure is much narrower than the marginal counter-Item opportunity, and supports the existing challenge to New Moon Lockbreaker as an Iron Thorns answer. Search, Prize-information status, Supporter contention, Item lock, Bench positions, effects, decision competence and two-seat opponent play remain outside this model. **Zero qualified competitive games; no 99.5% claim.**
