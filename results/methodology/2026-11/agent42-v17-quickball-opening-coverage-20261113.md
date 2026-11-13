# v17 Quick Ball opening coverage and discard-risk boundary

**Agent42 · 13 November 2026**  
**Evidence class:** exact combinatorial derivation from the fixed candidate 60; no game simulation or strength inference.

## Question

How often can the current candidate-only v17 Quick Ball root be proposed from the first seven cards, and how often does its duplicate-only payment heuristic choose a non-Energy card?

This extends the raw opening-hand comparison in [Agent14's Hood Shield profile](../../aichi-2026/2026-11/agent14-hood-opening-hand-profile-20261112.md). The fixture's exact seed-derived hand is recorded in [Agent49's opening-hand reconstruction](agent49-v3-fixture-opening-hand-reconstruction-20261113.md). It does not score the deck or predict game outcomes.

## Exact results

The fixed candidate [Hood Shield Shadow Rider v1](../../aichi-2026/candidate-hood-shadow-rider.json) contains one Quick Ball, 14 Basic Pokémon, 11 Psychic Energy, and the following duplicated non-Quick-Ball printings: Shadow Rider Calyrex V ×4, Shadow Rider Calyrex VMAX ×4, Lillie's Clefairy ex ×2, Lillie's Determination ×2, Mysterious Treasure ×4, Fog Crystal ×4, VS Seeker ×2, Stealthy Hood ×2, and Psychic Energy ×11.

| Event | Exact count / denominator | Probability |
|---|---:|---:|
| A keepable raw seven-card hand (at least one of 14 Basics) | 332,682,240 / 386,206,920 | 86.14% |
| Quick Ball root passes its opening-hand gates: Quick Ball + a Basic + a duplicate printing + an open Bench | 16,687,315 / 332,682,240 keepable hands | **5.0160%** |
| Same Quick Ball-root gate, unconditional over all raw seven-card hands | 16,687,315 / 386,206,920 | 4.3208% |
| Among root-eligible hands, a duplicated non-Energy printing exists (so the helper prefers non-Energy) | 7,553,157 / 16,687,315 | **45.2629%** |
| Among root-eligible hands, Psychic Energy is the only duplicated printing | 9,134,158 / 16,687,315 | **54.7371%** |
| Exact v17 fixture hand: Quick Ball, Arven, Float Stone, one Shadow Rider Calyrex V, and three Psychic Energy | 660 / 332,682,240 keepable hands | **1 in 504,064** |

The exact fixture multiset has unconditional probability 660 / 386,206,920 (about 1 in 585,162 raw seven-card hands). Its rarity is not a defect in a deterministic mechanics fixture, but it is not a representative opener or a sample of deck performance.

## Method

For each distinct printing (i) with (c_i) copies, let `D_k = [x^k] ∏_i (1 + c_i x)`; this coefficient counts (k)-card subsets with no repeated printing.

After fixing the unique Quick Ball in the opening seven, choose six cards from the remaining 59. The root-gate count is:

```text
root_gate_count =
    C(59, 6) - C(45, 6) - D6 + D6_nonbasic
    - (C(14, 6) - D6_basic)
  = 16,687,315

D6_basic = 924
```

The terms respectively count all six-card subsets, remove hands with no Basic, remove all-distinct-printing hands, restore all-distinct non-Basic hands, and remove only the 2,079 six-Basic hands that also contain a duplicate and therefore fill the Active plus five Bench slots under the setup policy. The 924 all-distinct six-Basic hands were already removed by the all-distinct term. The donor-branch split separately counts hands with no repeated non-Energy printing while allowing repeated Psychic Energy.

The complete standard-library reproduction is [agent42-v17-quickball-opening-coverage.py](agent42-v17-quickball-opening-coverage.py). Run:

```sh
python3 results/methodology/2026-11/agent42-v17-quickball-opening-coverage.py
```

## DCI / AMR implication

The current [Quick Ball root](../../../simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs) requires any duplicate non-Quick-Ball printing. The [physical continuation](../../../simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs) then prefers a duplicated non-Energy card whenever one exists; otherwise it chooses a Psychic Energy. That is a deterministic physical-card selector, not a state-dependent Discard Capable Index.

In **45.26%** of opening hands that pass the root's local gates, this rule can select a duplicated non-Energy printing. That category includes Basic Pokémon and functional search cards such as Mysterious Treasure and Fog Crystal. A second copy is not automatically discardable: its value depends on the board, matchup, remaining lines, Prize knowledge, Supporter contention and whether the card is needed for an archetype-specific line. This is exactly the distinction between duplicate count and DCI/UDP/AMR in [the supplied human concepts](../../../resources/human_concepts.md).

For the actual deterministic v17 hand, there is no duplicated non-Energy card: the three Psychic Energy are the only duplicate group. The helper therefore selects one exact Energy object and leaves two in hand. This is a plausible payment for this particular fixture, not evidence that the duplicate-only rule is generally safe.

The 5.0157% figure is an **opening-hand proposal upper bound**, not completed-setup frequency. It assumes no Item/Pokémon lock, a nonempty deck, and the setup resolver benches at most five Basics. It does not model mulligan redraws, later draws, Arven finding Quick Ball, target quality, donor strategic value, native action acceptance, or whether completing the setup improves the game. It must not be described as a 5% game win-rate effect.

## Recommendation

- Keep the fixed 60 and v17 policy unchanged until the first native game is obtained; do not tune the policy to this one seeded hand.
- Before using this helper as a general competitive policy, replace duplicate-only payment selection with a candidate-specific, state-dependent DCI/AMR decision. Protect Basic Pokémon that are useful Bench targets and search connectors whose remaining copies are needed for the planned line; abstain when no sufficiently low-cost donor exists.
- Preserve the existing exact physical donor, source-card, target-to-Bench and completed-setup receipts. Evaluate any revised donor policy on a preregistered, failure-inclusive set of natural deals rather than a selected successful opener.

No deck change, matchup result, or win-rate claim follows from this calculation.
