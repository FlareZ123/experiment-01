# First complete native rank5 source game: Fog Energy and Lillie after Pass do not combine into attack

**Agent 21, 9 November 2026.** Frozen original rank5 Mew Genesect source vs fixed New Moon, one registered seed. This is a **four-path retrospective single-deal policy counterfactual**, never an independent estimate of deck win rate.

## Four source-identical native paths

All four native paths reused the exact original candidate/source 60, seed `3861605836`, original rank5 source seat0 and New Moon candidate seat1, with separately isolated policy/physical shuffle randomness and the same source/full physical opening-deal digests. Each fork is default-off and changes only the stated *candidate-exposed* resource decision in this particular deal. The Lillie alternative was applied with a symmetric both-seat owner-visible function, but only candidate seat1 encountered it.

| Native path | First Fog Crystal owner-deck response (root23) | Candidate turn2 Lillie after prospective Pass | Candidate physical turn2 Psychic attachment | Candidate accepted attacks | Winner, native | Roots |
| --- | --- | --- | --- | ---: | --- | ---: |
| Unmodified archived case | Duskull VIV | None | No | 0 | Source | 149 |
| Lillie after Pass only | Duskull VIV | Native Lillie play; eight drawn | No | 0 | Source | 135 |
| Fog Energy target only | Basic Psychic Energy MEE | None | **Yes**, native root27 | **1** (Squawkabilly ex Motivate, turn24) | Source | 149 |
| **Both interventions** | Basic Psychic Energy MEE | **Yes**, native Lillie play | **Yes**, native root27 | **0** | Source | 151 |

The two separate single-intervention archives, their root-prefix proof and native payment evidence: [Lillie replay 42630536221](https://github.com/FlareZ123/experiment-01/actions/runs/42630536221) ([artifact 13681335041](https://github.com/FlareZ123/experiment-01/actions/runs/42630536221/artifacts/13681335041)) and [Fog Energy replay 42632890306](https://github.com/FlareZ123/experiment-01/actions/runs/42632890306) ([artifact 13681237890](https://github.com/FlareZ123/experiment-01/actions/runs/42632890306/artifacts/13681237890)).

**New full combination:** [manual CI run 42633658520](https://github.com/FlareZ123/experiment-01/actions/runs/42633658520), [full native physical tape artifact 13682023368](https://github.com/FlareZ123/experiment-01/actions/runs/42633658520/artifacts/13682023368). Five exact source/prefix/Fog prompt physical assertions all pass, with genuine **one accepted Fog Basic Psychic search, zero rejected** and **one accepted Lillie play, zero rejected**. The compound path had 151 accepted Store roots, four original source Cross Fusion Strike attacks, no candidate attacks, final native Prizes `[0,6]`; naturally ended source winner.

## Actual conclusion

Both interactions are individually accessible and native-legal-appearing, yet their independent tactical effects **do not sum monotonically**. In particular, the one accepted late Motivate attack in the Fog-only fork disappears when the same early Fog search is combined with an optional Lillie shuffle/draw. No physical source/candidate original 60 changed. This outcome illustrates context-dependent action value: an automatic "play every available draw Supporter" rule may change downstream Energy/attacker access or delays even when each action is playable.

That observation is still **one seed and one source opponent**. It neither establishes that Lillie is strategically inferior in general nor quantifies performance, and it cannot tell whether a more competent player with the newly drawn eight cards would reach a different result. The combined candidate played more actions without attacking; prioritize **whole-turn objective and resource-to-attack planning**, then test a **precommitted** symmetric policy across unobserved source deals. Do not accumulate additional posthoc mutations of this selected seed as if independent outcomes.

The unchanged [exact native Fog runner](../../../simulation/evaluation/2026-11/agent21-rank5-fog-energy-choice-counterfactual.cjs) supports the composition only with environment variable `AGENT21_RANK5_COMBINE_LILLIE=true`, writes a distinct atomic artifact, and remains default-off. Original rank5 archive and prospective intake are untouched.

**Competition gate:** zero independently paper/clock/strategy-qualified games, 29/32 authenticated original source inventories, three missing lists (23/25/28), no demonstrated fixed 60 or 99.5% performance.