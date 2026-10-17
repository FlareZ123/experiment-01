# Agent 42: Wobbuffet natural T2 recovery against Active Iron Thorns

**17 October 2026.** Evidence classes: direct printed-card interaction; completed pinned-Store matrix; exact finite-population resource-access model; independent physical-permutation regression. This report makes no played-game or match-win-rate claim.

## The dual-lock interaction

The fixed [Temple v1](candidate-temple-shadow-rider.json) includes one Psychic-type Wobbuffet PHF 36, one Dragon-type Radiant Eternatus CRZ 105, four Shadow Rider Calyrex V CRE 74, three VMAX CRE 75, eleven Psychic Energy and no Canceling Cologne. Three source Iron Thorns decks occupy ranks 6, 24 and 29.

Printed Abilities and the supplied Advanced Player's Rulebook imply the following mid-turn state when opposing Iron Thorns ex is Active:

| Our board / Item used | Opposing Initialization | Our Psychic VMAX Underworld Door | Our Dragon Radiant Gate |
| --- | --- | --- | --- |
| Wobbuffet Active; no Cologne | suppressed | available | suppressed |
| Wobbuffet Active; Cologne | suppressed | available | suppressed |
| Wobbuffet Benched; no Cologne | active | suppressed | suppressed |
| Wobbuffet Benched; Cologne | suppressed | available | available |

Bide Barricade removes other Pokémon's Abilities except Psychic Pokémon. Iron Thorns ex is Lightning and has a Rule Box, so its Initialization is suppressed by an Active Wobbuffet. Psychic VMAX retains its Ability; Dragon Radiant does not. If Wobbuffet goes to Bench, Initialization becomes active again unless the opponent's Active Pokémon is additionally neutralized. Canceling Cologne targets the *opponent's* Active Pokémon for the current turn, so it cannot restore a Dragon Radiant Ability suppressed by our own Active Wobbuffet.

The [pinned Store matrix probe](../../simulation/twinleaf/radiant-wobbuffet-thorns-matrix.cjs), [manual CI run 38853128884](https://github.com/FlareZ123/experiment-01/actions/runs/38853128884), passed. The corrected research hook reproduced all four expected rows, including Underworld Door visibility and the Radiant Gate prompt. The unmodified upstream engine disagreed on Wobbuffet Benched without Cologne: it **offered the Radiant Gate confirmation prompt despite active Initialization**, although its VMAX Underworld Door was suppressed. Treat that unmodified branch as a specific known gate-fidelity defect. The opt-in correction is [radiant-gate-lock-hook.cjs](../../simulation/twinleaf/radiant-gate-lock-hook.cjs). This is a staged effect-level matrix, not a full legal match.

### Same-state actual Underworld Door action

An additional [pinned full-effect action fixture](../../simulation/twinleaf/underworld-door-action.cjs), extending Agent 11's established Hood/Thorns/Garbotoxin controls, now contrasts the same Active Wobbuffet + Benched VMAX + opponent Active Iron Thorns board with **both choices of turn player**. [Manual compiled CI 38998714952](https://github.com/FlareZ123/experiment-01/actions/runs/38998714952) passed:

| Store acting seat | Listed Underworld Door power | Direct PowerEffect | Energy attached | Cards drawn |
| --- | --- | --- | ---: | ---: |
| Wobbuffet owner's opponent (Thorns seat 0) | no | blocked by Ability | 0 | 0 |
| Wobbuffet owner's seat 1, legal owner turn | yes | allowed | **1** | **2** |

Both results were the same with or without Tool Jammer attached to opposing Active Iron Thorns, which cannot turn off the active Wobbuffet's Ability.

The initial attempt at this extension had the **Thorns player marked as the turn player** while directly announcing Underworld Door for the opposing seat. Its failing assertion in [CI 38998268165](https://github.com/FlareZ123/experiment-01/actions/runs/38998268165) exposed that fixture setup mistake; the subsequent characterization [CI 38998505908](https://github.com/FlareZ123/experiment-01/actions/runs/38998505908) confirmed BLOCKED_BY_ABILITY in that branch. A turn-player correction succeeded, and all prior fixture controls remained green. The pinned priority engine's different cross-turn visibility is a potential separate board-lock fidelity concern, but a PowerEffect announced on the opponent's turn cannot count as a legal gameplay counterexample. This action fixture still sets up the midgame board directly rather than evolving V and moving Wobbuffet through a full legal game.

## New exact resource opportunity

If Wobbuffet starts Active against Iron Thorns, Radiant Gate is unavailable while Wobbuffet stays Active. One natural alternative is to Bench Shadow Rider V on our first turn, evolve it into VMAX on our second turn, then use its Underworld Door while keeping Wobbuffet Active. This requires a Psychic Energy card in hand at the time of using Underworld Door.

The restricted event counts only these physical resources:

1. The sole Wobbuffet is among the *initial seven* and is selected as Active.
2. At least one Shadow Rider Calyrex V appears by the first ordinary turn draw (first eight cards seen).
3. At least one Shadow Rider Calyrex VMAX and one Psychic Energy appear by the second ordinary turn draw (first nine cards seen).

No searches, mulligan bonus draws, Supporters, Items, additional Ability draws, opponent disruption or attacks are applied. Wobbuffet and Shadow Rider V can occupy the Active and Bench spaces respectively. Six random Prizes are integrated implicitly, since a resource in the first nine draws cannot also be in the Prize zone. Every randomly ordered legal seven-card opening is conditioned on containing at least one Basic Pokémon.

| Restricted source-locked Temple event | Probability given accepted opening |
| --- | ---: |
| Wobbuffet appears in opening seven | **13.22003079%** |
| Wobbuffet opener + natural V/VMAX resource by T2, no Energy condition | **1.77289333%** |
| Wobbuffet opener + natural V/VMAX and Psychic Energy by T2 | **1.34250139%** |
| Last event conditional on Wobbuffet in opening seven | **10.15505492%** |

The exact accepted-opening fraction for the full V/VMAX/Energy event is **286599649 / 21348182700**.

## Method and validation

The manifest yields categories Wobbuffet=1, Shadow Rider V=4, VMAX=3, Psychic Energy=11, all others=41 and Basic Pokémon=15. Given that Wobbuffet lies in the initial seven, the first eight observed positions include seven selections from the 59 other cards. An exact weighted hypergeometric enumeration counts every possible allocation of those seven selections. The ninth observation is the one ordinary T2 draw, with 52 remaining positions. Its possible successful category depends on whether VMAX or Psychic Energy is still missing. Each selection count is a BigInt combinatorial integer.

The final numerator multiplies the conditional event by the probability 7/60 of Wobbuffet in the opening seven and divides by the probability of an accepted opening, which equals 1 minus C(45,7)/C(60,7).

[The CJS model](../../scripts/aichi-temple-wobbuffet-thorns-t2.cjs) asserts the source manifest counts, returns the exact reduced fraction, and prints a machine-readable result. [Its regression suite](../../tests/aichi-temple-wobbuffet-thorns-t2.test.cjs) exhausts every ordering of an independent eight-card toy deck, comparing all accepted first-three openings and the next two draws against the weighted formula. This is part of the existing [manual-only opening CI](../../.github/workflows/aichi-radiant-start-tradeoff.yml), which passed [run 38998088280](https://github.com/FlareZ123/experiment-01/actions/runs/38998088280) at commit `b2784cc9`, and requires no Twinleaf checkout.

### Iron Thorns mulligan-offer sensitivity

The three source Iron Thorns lists each have four starting-eligible Basics and frequently offer optional mulligan bonus cards. Wobbuffet must remain in the *original opening seven* to be chosen as Active; extra cards drawn during setup may supply V, VMAX or Psychic Energy.

| Optional bonuses accepted | Direct Wobbuffet + natural V/VMAX/Energy T2 opportunity |
| ---: | ---: |
| 0 | 1.34250139% |
| 1 | 1.79657051% |
| 2 | 2.28805572% |
| 3 | 2.80565266% |
| 4 | 3.33947260% |
| 5 | 3.88115468% |

With a four-Basic Iron Thorns opponent, the bilateral setup procedure offers at least one optional extra card with probability **57.017203%**. Weighting all bonus counts by the exact [bilateral distribution](bilateral-mulligan-externality.md), taking each offered card and capping at 45 to preserve two ordinary draws, yields **2.04106361%** for this restricted natural T2 event. The no-bonus comparator is 1.34250139%, a difference of 0.69856222 percentage points. The chance of 45 or more offers is approximately 1.025e-10 and is aggregated into the 45-bonus scenario.

Six random Prizes are integrated out, as in the original model. No searches, opponent attacks, Supporters, Abilities or discard constraints are simulated. This is a conditional resource opportunity rather than an executed line or match-winning probability. Source-counted BigInt formulas and exhaustive eight-card physical-deal regressions with 0, 1, and 2 bonuses passed [manual CI 38999240311](https://github.com/FlareZ123/experiment-01/actions/runs/38999240311).

## Interpretation and limits

This is a small **direct-draw** natural recovery resource window. It does not estimate how often Temple actually evolves or attaches with its many search and draw cards, and it cannot by itself establish that the Wobbuffet slot improves the Iron Thorns matchup. Opposing attacks, evolution denial, unavailable Energy in hand at the Ability moment, one-Supporter contention and card-search discards may alter playability. The probability is neither a general upper bound nor a reliable lower bound on practical turn-two Psychic VMAX access.

A decisive next replay should use both published fixed 60-card source decks in a physically dealt game, compare an Active Wobbuffet natural-evolution line with a Wobbuffet Benched policy under Iron Thorns, and record the opponent's best actual replies. Keep the research-only gate timing correction explicit. No 99.5% full-field win-rate evidence is provided here.
