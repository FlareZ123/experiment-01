# Agent 25: ordinary Dhelmise attack availability differs from Dragon-weakness ALS

**1 Nov 2026 | exact multivariate physical-location enumeration | zero original Store games attributed to this calculation.**

## Important representation correction

A prior strict first-turn Dhelmise HNS benchmark counted only **Telepathic Psychic Energy** and insisted at least one **Lillie's Clefairy ex** survived Prize placement and remained in hand/deck. That event describes one narrower **Dragon-type weakness-amplified** line. **Dhelmise M5 Vengeful Anchor has a printed one-Psychic Energy attack cost.** Any one of the four included Telepathic Psychic Energy or six included **Basic Psychic Energy** can pay it. Clefairy is useful for amplifying Psychic damage against Dragon targets, but it is not necessary for the ordinary 30/170-damage attack. Therefore the previous 7.24% figure substantially understated the frequency of a strictly defined physical opportunity for an ordinary attack.

The new [independently enumerated exact scenario model](../../scripts/agent25-dhelmise-any-psychic-attack-opening.cjs), using the generalized [lock-aware combinatorial kernel](../../scripts/agent25-dhelmise-lock-conditioned-opening.cjs), explicitly distinguishes these targets. The fixed **source v2 60** remains untouched. For the ordinary attack, the two actual Clefairy cards remain counted among `other`; they are **not deleted** when their availability condition is disabled.

### Exact necessary physical-event definition

One random seven-card opening and **exactly one ordinary subsequent draw**; six uniformly random unseen Prize cards are set from the remainder; the player must physically have a Dhelmise in the opening seven, a matching usable Psychic Energy card in the opening eight, and one of: held Brilliant Blender, held Arven with Blender still in deck, or two held Battle Compressors. At least four **currently Ability-eligible HNS donor Pokémon** must physically remain in deck after the opening hand/draw/Prize removal, and at least one Clefairy remains in hand/deck **only** for the explicitly narrower Dragon-weakness route. Stage1 Banette is Psychic; Basic Shuppet is Psychic; Stage1 Sinistcha is Grass. When Wobbuffet suppresses non-Psychic discard Abilities, or Silent Lab suppresses Basic discard Abilities, only six of eight original donor printings remain eligible. Active Garbotoxin suppresses all eight. There is no assumption that any of those locks is actually established at the time.

All reported probabilities are **exact weighted card-location fractions**, enumerated with integer combinatorial counts, then converted to decimal. They are **necessary-only opportunity events**, not game success or evidence that the whole sequence is legal that turn. They omit turn order, inability to play Supporters going first, Item locks, actual searches, discard selection, damage, knockouts, opponent actions, prize choice, mulligans, and all future card draw or actions. Conditional Basic-valid probabilities divide by the probability of at least one Basic Pokémon in the initial seven; they remain an abstract conditioning, not a full mulligan simulator.

## Source v2 fixed eight-donor results

| One-turn physical criterion | No suppressive lock | Wobbuffet Active or Silent Lab Active | Tool-enabled Garbotoxin |
| --- | ---: | ---: | ---: |
| **Four Telepathic only plus Clefairy available** | **7.243543%** | **6.648246%** | 0% |
| Four Telepathic only, no Clefairy required | 7.313270% | 6.714274% | 0% |
| **Any of ten Psychic-providing Energy, Clefairy optional** | **13.910619%** | **12.712666%** | 0% |

The ordinary version increases the target event by **6.667077 percentage points** without named locks, mainly because it recognizes the six ordinary Basic Psychic Energy cards already occupying legitimate slots in the fixed 60. In the Wobbuffet/Silent Lab donor-suppression counterfactual, it increases by **6.064420 percentage points**. The broad ordinary physical event probability conditioned on an opening seven containing a Basic is **16.148675%** without lock, **14.757985%** with one of those partial locks.

## Abstract more-donor variants: preserve the two/four-card cut cost

Only **the eight-donor row represents a fully specified candidate 60**. The ten-donor 4 Banette + 3 Shuppet + 3 Sinistcha scenario requires cutting **two** other unspecified cards. The twelve-donor 4+4+4 scenario requires cutting **four** other unspecified cards. All keep four Dhelmise, four Telepathic, six Basic Psychic, four Arven, one Blender, four Compressor, with the other category shrunk accordingly.

| Hypothetical HNS donor copies | Other-card slots sacrificed | Ordinary any-Psychic physical opportunity without lock | With active Wobbuffet / Silent Lab |
| --- | ---: | ---: | ---: |
| 8 (original fixed v2) | 0 | 13.910619% | 12.712666% |
| 10 | 2 | 13.991587% | 13.634968% |
| 12 | 4 | 13.994088% | 13.910619% |

In this exact event, the extra eight-to-twelve donors chiefly help **against partial donor-Ability locks**; the unrestricted gain is small because having an eligible Psychic Energy and a discard outlet still constrains the starting hand. There is no proof that a real 12-donor fixed list is stronger after cutting four necessary Item/Supporter/Bench/defensive resources.

## Consequences

1. **Differentiate nominal attack feasibility from Dragon OTK feasibility**. A flexible attacker can make a legal ordinary attack with a Basic Psychic Energy while lacking the specialized Telepathic/Clefairy acceleration chain.
2. **Improve the actual native policy before overfitting donor counts**. In same-seed native comparisons, prioritizing held Battle Compressor on the candidate seat increased discard donor counts in source ranks 10 and 11. It also produced a worsened action-cap Prize result against rank10, so the number of donor cards in discard alone is an inadequate objective. See [paired original Store report](agent25-dhelmise-v2-compressor-same-seed-six-arm-20261101.md).
3. **Preserve named-lock conditionality**. The 0% full-Garbotoxin value is a pure counterfactual assuming active Ability suppression. Field Blower and Faba may remove Tools; such responses are outside this pre-action model.

Proof code and pure reproducibility:
[exact normal versus narrow scenario](../../scripts/agent25-dhelmise-any-psychic-attack-opening.cjs);
[regressions](../../tests/agent25-dhelmise-any-psychic-attack-opening.test.cjs);
[manual CI 41273257755](https://github.com/FlareZ123/experiment-01/actions/runs/41273257755), **PASS**, pinned 1 Nov commit `1cd8e82255efab04afcdfadca9d5a6e732c43911`. The same outputs were independently checked using Python's `math.comb`.

**Benchmark unchanged:** 29/32 original source Top32 60s; zero competitively qualified games; no demonstrated 99.5% fixed deck.
