# Best nominated fixed 60: all authenticated Aichi sources, Skyliner native mobility

**Agent 3 | 9 November 2026 | completed pinned native CI [42645102246](https://github.com/FlareZ123/experiment-01/actions/runs/42645102246) | full game ledgers and 58 paired opening fingerprints [artifact 13687063828](https://github.com/FlareZ123/experiment-01/actions/runs/42645102246/artifacts/13687063828).**

## Decision

**Keep the existing Hood Shield v1 as the currently nominated printed fixed 60, and keep the source-independent `actorSkylinerFundedBenchRetreatRoot` as a development-only, default-off policy until its effective-cost witness and opponent-competence limits are addressed.** The new owner-public actor option caused **six genuine, physically accepted native Store RetreatActions followed by an attack declaration on the same turn** and increased Max Geist declarations by five, against 29 separate original Aichi source lists in both physical seats. **None of 44 identically matched naturally completed paired games changed the winner**, and a 14-pair native action cap prevents complete field performance estimation. This is actionable evidence of higher realized attack access without evidence of higher game win rate.

The tested 60 was the unchanged [Hood Shield v1](../../aichi-2026/candidate-hood-shadow-rider.json), Git blob `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`. Both arms used precisely that 60, the same original source 60 in every game, identical shared actor option set, same source-policy branch, same paper-profile hook and same physical deal. The **only experimental intervention** was `actorSkylinerFundedBenchRetreatRoot:true` in the treatment. The source-independent owner-only Skyliner helper was already implemented in `simulation/twinleaf/agent2-owner-skyliner-funded-bench-frontier.cjs` and was newly wired into shared `agent34-actor-only-root-policy.cjs` as an optional native `RetreatAction`, conservatively screened for public Path, Silent Lab, Thorns Initialization, Garbotoxin, Alolan Muk, Klefki and other known suppression. Its selected funded recipient is public; the opponent's hidden zones never enter the decision. The actual native Store adjudicates legality. [Frozen registration](../../aichi-2026/registrations/2026-11/agent3-skyliner-hood-v1-authenticated29-20261109.json), [reproducible runner](../../../simulation/evaluation/agent3/skyliner-hood-v1-authenticated29-native.cjs) and [regression test](../../../tests/2026-11/agent3-skyliner-hood-v1-authenticated29-native.test.cjs).

## Exact aggregate, paired denominator and ceiling

| Measure | Baseline exact 60 | Skyliner option exact 60 |
| --- | ---: | ---: |
| Native original-source games | 58 | 58 |
| Native natural terminals | 44 | 44 |
| Candidate native wins | 30 | 30 |
| Native action-cap 260 | 14 | 14 |
| Engine errors/aborts | 0 | 0 |
| Actor-selected Skyliner free mobility | 0 | 6 |
| Actual candidate RetreatAction roots | 0 | 6 |
| Candidate Max Geist declarations | 77 | 82 |
| Candidate Filch declarations | 15 | 15 |
| Candidate Night Watch declarations | 0 | 0 |
| Independent paper-qualified competitive matches | 0 | 0 |

**Physical and opponent admission:** The 29 original verified 60-card opponents are Aichi ranks 1–22, 24, 26–27, 29–32. Original ranks **23, 25 and 28 have no authenticated full printed lists**. There were 58 preregistered fresh independent source openings, each in both arms. **58/58 matched** the exact entire two-player physical opening, source deal and true native starter seat. Both candidate seats A and B were covered once per source rank. **44/58 pairs** produced a native terminal in both arms; **14/58** were censored in both arms. Native terminal winner differences: **0 treatment gains, 0 treatment losses**. Allowing every censored game its logically possible native winner, the sharp treatment-minus-control *candidate-win-count* range is **[-14,+14]** among these 58 pairs. This is not a confidence interval. Native wins 30/58 are `native` attempts with 14 censored, and neither 30/58 nor 30/44 supports a competitive paper win-rate claim.

**Engine:** pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, same `agent19-composed-paper-semantics-profile-v1` in both arms with `celestialRoar`, `mewEnergyMix`, `attachEnergyTarget` scoped true; `nativeRootActionLimit:260`. Every raw native action, opponent reply, Prize transition, aborted/capped disposition, local source RNG and physical fingerprint remains in [CI artifact 13687063828](https://github.com/FlareZ123/experiment-01/actions/runs/42645102246/artifacts/13687063828).

## Six accepted Skyliner pivots and immediate action conversions

The following events were *actual live Store actions*, not hypothetical graph paths. The corresponding opponent original 60 and next native turn actions remained part of the simulation.

| Original source rank, candidate seat | Global turn / native root | New Active | Next candidate attack on same turn | Native outcome |
| --- | --- | --- | --- | --- |
| 2, B | 25 / 128 | Shadow Rider Calyrex VMAX | Max Geist | candidate win, same as baseline |
| 7, B | 39 / 156 | Shadow Rider Calyrex VMAX | Max Geist | action-cap, same as baseline |
| 10, A | 11 / 52 | Girafarig LOT | Get Lost | source win, same as baseline |
| 11, A | 24 / 127 | Shadow Rider Calyrex VMAX | Max Geist | candidate win, same as baseline |
| 18, A | 30 / 123 | Shadow Rider Calyrex VMAX | Max Geist | candidate win, same as baseline |
| 27, B | 21 / 111 | Shadow Rider Calyrex VMAX | Max Geist | candidate win, same as baseline |

All six native root records show **accepted=true**, the candidate's public Active printing changed to the identified Benched recipient, the turn remained in main phase long enough to announce the next attack, and the per-player publicly attached Energy-card counts stayed unchanged across the exact retreat dispatch (six of six). These facts are consistent with Latias ex SSP's effective-zero-Cost Skyliner retreat. The new owner-visible option did not activate against rank 6 Iron Thorns ex in these two openings, consistent with its explicit known-public-lock veto.

**Native physical-witness discrepancy at study revision:** While actual Store transitions were visible, `rootPhysicalWitness` labeled all six `skyliner-free-retreat` native roots `no-confirmed-public-effect`. After this whole-field study, Agent 3 discovered that the snapshot collector `rootPhysicalSnapshot` was only populating `targetPokemonPrinting`, `publicSkylinerPresent`, `retreatedTurn`, and `targetEnergies` for older `skyliner-rondo-retreat` / `paid-retreat` intent kinds, leaving those fields **null/absent** for the new `skyliner-free-retreat`. That is a **witness instrumentation omission**, not a native rejection: all six actions were accepted and visibly swapped the public Active. A later commit extends both snapshot membership lists to the new kind and adds an actual before/after `rootPhysicalSnapshot` unit regression. The original 116-game study is **preserved as run**, so the corrected receipt cannot be credited retrospectively as if collected at the historical commit. [Focused posthoc three-deal repair runner](../../../simulation/evaluation/agent3/skyliner-native-witness-repair-three.cjs) exercises exact pre-repair crash cases separately.

## Complete per-rank source status

Here each opponent rank had **two physical seat pairs**, with one actual candidate owner in each seat. Native candidate wins are counts out of two attempts **including still-censored attempts**, not competitive win estimates. Bounds are per-rank treatment-minus-control candidate-win-count possibilities over physically matched pairs.

| Original rank | Physical matched | Both terminal | Native wins control/treatment | Skyliner selections | Sharp count bounds |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 2 | 2/2 | 1/2 | 1/1 | 1 | [-1,1] |
| 3 | 2/2 | 0/2 | 0/0 | 0 | [-2,2] |
| 4 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 5 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 6 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 7 | 2/2 | 1/2 | 0/0 | 1 | [-1,1] |
| 8 | 2/2 | 1/2 | 1/1 | 0 | [-1,1] |
| 9 | 2/2 | 1/2 | 1/1 | 0 | [-1,1] |
| 10 | 2/2 | 2/2 | 1/1 | 1 | [0,0] |
| 11 | 2/2 | 1/2 | 1/1 | 1 | [-1,1] |
| 12 | 2/2 | 2/2 | 2/2 | 0 | [0,0] |
| 13 | 2/2 | 2/2 | 2/2 | 0 | [0,0] |
| 14 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 15 | 2/2 | 1/2 | 0/0 | 0 | [-1,1] |
| 16 | 2/2 | 0/2 | 0/0 | 0 | [-2,2] |
| 17 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 18 | 2/2 | 1/2 | 1/1 | 1 | [-1,1] |
| 19 | 2/2 | 1/2 | 1/1 | 0 | [-1,1] |
| 20 | 2/2 | 1/2 | 1/1 | 0 | [-1,1] |
| 21 | 2/2 | 2/2 | 2/2 | 0 | [0,0] |
| 22 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 24 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 26 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 27 | 2/2 | 2/2 | 2/2 | 1 | [0,0] |
| 29 | 2/2 | 1/2 | 0/0 | 0 | [-1,1] |
| 30 | 2/2 | 2/2 | 1/1 | 0 | [0,0] |
| 31 | 2/2 | 2/2 | 2/2 | 0 | [0,0] |
| 32 | 2/2 | 2/2 | 2/2 | 0 | [0,0] |

## Practical consequence for single-deck optimization

The native behavior validates a **specific production-policy gap**: a funded Benched attacker can be stranded behind a low-damage Basic while Latias ex's public Ability grants a free pivot. The known-public-action helper now correctly chooses a RetreatAction from an ordinary detached actor view and the native Store accepts it, including under six different original opponents. That improves real tactical action access and can add attack tempo. The same fixed deck nonetheless recorded **zero winner improvement in this fresh cohort**. Avoid adding cards, removing necessary tactical protection or changing the current nominated best 60 on the basis of theoretical setup connectivity or these six pivots alone.

The follow-up decision is to improve native attack/disruption decision policies and opponent capability, reduce root-260 censoring with affordable higher-cap sensitivity, and seek actual paper-qualified matchups rather than claim 99.5%. The earlier posthoc Hood Consistency v2 Mimikyu→Night Watch winner reversal is complementary evidence of one exceptional opponent state; it is *not* a representative rank5 win uplift. [Earlier result](./agent3-hood-v2-skyliner-mimikyu-to-night-watch-20261109.md).

**Claim level:** native pinned simulation / root dispatch evidence, six settled immediate attacks; no independent paper-legal competitive win-rate estimate, no all-32 field coverage, no demonstration of a 99.5% game win rate.
