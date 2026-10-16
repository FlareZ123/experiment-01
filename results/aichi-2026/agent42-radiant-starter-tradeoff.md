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

## Extension: first ordinary draw and direct search Items

The [seven-category first-turn enumerator](../../scripts/aichi-radiant-wobbuffet-turnone.cjs) independently extends the source-locked comparison to the one mandatory first-turn draw, five search Items (four Mysterious Treasure and one Quick Ball), and one Hisuian Heavy Ball. It follows exactly the route priority and resource rules of the preexisting [Agent 7/13 first-turn Radiant model](../../scripts/radiant-eternatus-opening.cjs). The first-turn model's *source access* probabilities reproduce that earlier six-category model at full integer precision when Wobbuffet is merged back into other Basics.

| First-turn restricted event | Champion | Hood | Temple |
| --- | ---: | ---: | ---: |
| Direct Radiant access route before Ability locks | 52.20484% | 52.20484% | 52.59209% |
| Access plus at least two VMAX remaining in deck | **50.65944%** | **50.65944%** | **46.38691%** |
| Subset where Wobbuffet is the only initial alternative starter, suppressing Gate if kept Active | 0% | 0% | **1.41532%** |
| Two-VMAX opportunity with a non-Wobbuffet initial starter | **50.65944%** | **50.65944%** | **44.97160%** |

For Temple's excluded two-VMAX event, disjoint model route contributions are **0.31292 percentage points** opening Radiant, **0.03913** topdeck Radiant, **1.02732** search-Item access and **0.03594** Heavy Ball recovery. The total is **1.41532 pp**. After this gate-awareness filter, Temple's structural gap to champion/Hood is approximately **5.68784 percentage points** within this strictly defined direct-access model. Other plausible VSTAR, additional draw, prize-redeal and card-use lines are omitted. The underlying access model assumes usable search Items without checking legal discard payment, Item locks, choice of connector or opponent disruption, and is **neither an attack/board establishment rate nor an overall upper or lower bound** for realistic games.

The [independent tests](../../tests/aichi-radiant-wobbuffet-turnone.test.cjs) exhaustively compare the seven-category enumerator with physical card deals, six-category legacy marginal probabilities, and route partition identities. Both first-seven and first-draw suites passed [manual CI 38851840613](https://github.com/FlareZ123/experiment-01/actions/runs/38851840613), retaining machine-readable result artifacts. Source rows and exact printings remain fixed.

## Pinned Store Ability-effect observation

A new [research-owned pinned Store probe](../../simulation/twinleaf/radiant-wobbuffet-active-probe.cjs) examines the same Radiant hand-to-Bench effect with Wobbuffet (a) Active and (b) Benched while another Psychic Basic is Active, with two VMAX in deck. The existing opt-in [Radiant entering-Bench timing hook](../../simulation/twinleaf/radiant-gate-lock-hook.cjs) was applied reversibly as a control for a separately observed hand-zone evaluation bug under Iron Thorns. **Importantly, both unmodified upstream and hooked pinned Store produced the same results in this Wobbuffet fixture:** Wobbuffet Active produces **no Climactic Gate confirmation prompt**, while Wobbuffet Benched produces a **Gate confirmation prompt**, and Radiant moves onto the Bench in both cases. Thus the Wobbuffet interaction itself is supported by the unmodified pinned engine in the tested state. The complete existing [manual pinned-engine workflow](../../.github/workflows/radiant-gate-engine.yml) passed [run 38851397159](https://github.com/FlareZ123/experiment-01/actions/runs/38851397159), including the new probe and earlier Forest Seal Stone tests. This is a staged effect-level observation. A full legal game, actual player switching and strategic result are not established.


## Fourth VMAX: connector-cost sensitivity within Temple

A controlled [one-slot resource-category perturbation](../../scripts/aichi-temple-vmax-slot-sensitivity.cjs) adds a fourth Shadow Rider VMAX to Temple and removes exactly one other slot. The resulting abstract profiles all still contain 60 cards, but they are **counterfactual category inventories**, not named, vetted, legal, recommended decklists. They reuse the exact first-turn resource/Prize model above, including Wobbuffet forced-Active self-lock.

| Removed source category to add VMAX | No-switch two-VMAX Gate opportunity | Change from unchanged Temple |
| --- | ---: | ---: |
| None: unchanged Temple (3 VMAX) | **44.97160%** | baseline |
| One of five direct-search Items (Quick Ball/Mysterious Treasure) | **43.86402%** | **-1.10758 pp** |
| Hisuian Heavy Ball | 48.23961% | +3.26801 pp |
| One other Basic Pokémon | 48.83098% | +3.85938 pp |
| One other non-Basic (generic remainder class) | **49.44878%** | +4.47719 pp |
| Wobbuffet itself | 50.65944% | +5.68784 pp |

**Important conditional result:** Within this exact model, replacing a search Item with the fourth VMAX makes the target line **less accessible** despite the extra VMAX copy. The loss of a connector outweighs the gain in remaining in-deck VMAX availability for the restricted sequence. Conversely, replacing an abstract other non-Basic improves this particular probability because the model treats all such cards as passive. The other non-Basic group contains Energy, Supporters, stadiums and other effects essential to the deck; no real candidate swap should be selected from it without full opportunity-cost, matchup and action analysis. Removing Hisuian Heavy Ball can harm unrelated critical singleton-Prize recovery, and removing Wobbuffet deletes a matchup-counter role. The Basic replacement group also contains strategically irreplaceable cards such as Mimikyu and Dialga-GX.

[Category-swap tests](../../tests/aichi-temple-vmax-slot-sensitivity.test.cjs) assert 60-card conservation, source counts, resource partition identities, and the specific negative direct-search swap. They passed [manual CI 38852171233](https://github.com/FlareZ123/experiment-01/actions/runs/38852171233) alongside the full first-seven and first-turn suites. The result reinforces why a superficial consistency increase is insufficient to select a final fixed deck; actual gameplay, opponent policy and omitted lines could reverse these proxy rankings.

