# Agent 42: Radiant Eternatus Gate and Wobbuffet starter tradeoff

**Date:** 16 October 2026. **Research level:** exact source-locked initial opening and Prize-composition probability, plus a printed-Ability interaction. This is **not** a complete gameplay sequence, a policy evaluation, or a game-win rate.

## Question

How do the published rank-1 Shadow Rider reference, Hood Shield v1 and Temple v1 differ in first-seven Shadow Rider V access, forced support-Pokémon opening, and direct **Radiant Eternatus CRZ 105 Climactic Gate** opportunity? Does Temple v1's **Wobbuffet PHF 36 Bide Barricade** conflict with its own Radiant Gate line?

The published source and two fixed candidate inventories are loaded as-is from [full-decklists.json](full-decklists.json), [Hood v1](candidate-hood-shadow-rider.json) and [Temple v1](candidate-temple-shadow-rider.json). The code asserts exact card counts and set/collector-number printings. It classifies all other printed Pokémon in those three lists as the eight known Basic Pokémon. No swaps were made.

## Exact conditional percentages

All probabilities condition on an **accepted seven-card opening**, meaning at least one Basic Pokémon in the opening seven. The initial six Prizes are treated as an unknown, uniformly random six-card subset of the remaining 53 cards. There are no first-turn draws, mulligan bonus draws, deck searches, switches, Supporters, Tools, or opponent actions in the opportunity calculation.

| Restricted event | Champion rank 1 | Hood Shield v1 | Temple v1 |
| --- | ---: | ---: | ---: |
| At least one Shadow Rider Calyrex V in seven | **36.61785%** | **46.37744%** | **45.26912%** |
| At least two Shadow Rider V in seven | 3.89451% | 7.33907% | 7.16368% |
| Radiant Eternatus can be Benched from opening hand (another Basic available to start) | 10.72815% | 10.72815% | 10.83024% |
| Radiant benchable **and two VMAX remaining in deck after six Prizes** | **10.50009%** | **10.50009%** | **9.79023%** |
| Previous event with a non-Wobbuffet Basic that can start Active | **10.50009%** | **10.50009%** | **9.47108%** |
| Previous two-VMAX event, but Wobbuffet is the *only* other starter | 0% | 0% | **0.31915%** |
| Benchable Tapu Lele-GX with another Basic to start | 20.07898% | 10.72815% | 10.83024% |
| All available starting Basics are Radiant Eternatus and/or Tapu Lele-GX | 9.73178% | 6.04312% | 5.13805% |
| Exactly one Basic in seven | 39.41763% | 39.41763% | 35.84686% |
| Exactly one Basic in seven that is not Wobbuffet | 39.41763% | 39.41763% | 33.45707% |
| Wobbuffet is available as a possible starting Active | 0% | 0% | **13.22003%** |

The champion has 3 Shadow Rider V, 4 VMAX, 2 Tapu Lele-GX, 1 Radiant Eternatus and 14 ordinary Basics. Hood has 4 V, 4 VMAX, 1 Lele, 1 Radiant and still 14 Basics. Temple has 4 V, 3 VMAX, 1 Lele, 1 Radiant, 1 Wobbuffet and **15** Basics.

## Card-rule interaction

**Wobbuffet PHF 36, Bide Barricade** says that while this Pokémon is Active, Pokémon in play, in hands and in discard piles have no Abilities *except Psychic Pokémon*. **Radiant Eternatus CRZ 105 is Dragon-type**, and its **Climactic Gate** Ability activates only on playing it from hand onto the Bench during the turn. Consequently, in a natural no-switch opening containing Radiant Eternatus and Wobbuffet as the only two Basics, Radiant must go to the Bench with Wobbuffet Active, but the latter suppresses Climactic Gate.

This creates a narrowly defined direct-opportunity exclusion affecting **0.31915 percentage points of Temple's accepted seven-card openings**, conditional also on two VMAX surviving in the deck after Prizes. It is **not a global impossibility**: a preceding legal switch, retreat or other board change could remove Wobbuffet from the Active Spot. Opponent-side Ability locks could separately deny Gate in all three lists. The first turn's available actions, the benching/positioning policy and whether ending one's turn with Gate is desirable are not represented.

The Temple two-VMAX Gate opportunity without forced self-lock is **9.47108%**, versus **10.50009%** in champion and Hood, a decrease of approximately **1.02901 percentage points** for this strictly defined opening event. Temple simultaneously reduces the initial exactly-one-Basic rate and gives a chance to start Wobbuffet against threats such as Meloetta's non-Psychic combo pieces. Those observations cannot establish a net strategic benefit, and Wobbuffet can be vulnerable to opposing Canceling Cologne.

## Model and evidence

For each profile, enumerate all seven-card multivariate hypergeometric hands in the disjoint categories Radiant, Tapu Lele, Shadow Rider V, Shadow Rider VMAX, Wobbuffet, other Basic and other card. Reject no-Basic hands. For every eligible Radiant hand, let `M` be the VMAX copies remaining outside the hand and count six-Prize subsets leaving two VMAX in the deck:

```text
sum over prized k with M-k >= 2:
    C(M,k) * C(53-M,6-k)
```

Weight by the opening-hand multinomial coefficient and normalize by all accepted-hand/six-Prize combinations. Use BigInt integer arithmetic until final display. The Wobbuffet exclusion checks whether any Basic other than Wobbuffet and Radiant can start Active; it does not assume a free switch.

Implementation: [exact source-locked enumerator](../../scripts/aichi-radiant-start-tradeoff.cjs), [source-locked physical-card and anchor regression tests](../../tests/aichi-radiant-start-tradeoff.test.cjs), and [manual-only workflow](../../.github/workflows/aichi-radiant-start-tradeoff.yml). The source-backed exact-model tests and report command both passed in [GitHub Actions 38851136392](https://github.com/FlareZ123/experiment-01/actions/runs/38851136392). The independent physical-deal test exhaustively counts 3,640 legal hand/Prize assignments in an 11-card miniature deck. It compares every named event with the hypergeometric implementation.

## Decision relevance and next test

This opening audit exposes an otherwise easy-to-miss **tech-card self-interference** and a real VMAX-count cost for Temple. It suggests testing Temple under two scripted initial boards with identical resource zones: (1) Radiant + Wobbuffet are the only initial Basics, Wobbuffet Active; (2) an additional Psychic Basic can start Active. Replay Radiant Benching with and without a prior legal switch under the pinned engine, asserting that Bide Barricade suppresses the first Gate and permits the second, then check the ability behavior against paper card text. Any competitive comparison must also account for Temple's Tool/Stadium response value, the strength of Wobbuffet's lock, and the opponent's reaction.

The 99.5% whole-field objective remains unverified. All three inventories remain provisional benchmarks, and no win-rate claim follows.
