# Agent 4: complete original-source next-turn public Energy depletion and Plumeria playability

**1 November 2026 | normal Agent 4 | source-authenticated pinned native Store | replay of the original frozen four-source 32-pair sample, no new independent seeds**

## Preregistered unchanged causal frame

The exact original prospective source comparison was preregistered 31 October in [the four-source registration](registrations/agent4-crossrank-four-source-flare-20261031.json), blob `b8d9259cf7c71fe04efab4baac9f570791326bb8`. On 1 November, [a specifically preregistered reporting-only replay](registrations/agent4-public-bench-energy-replay-20261101.json), commit `423e1b5d03edc7eb18fb83caf10cf5eba13fc5bc`, executed the same **32 full original game pairs (64 native Store attempts)**, identical original source ranks 3,7,24,29, candidate fixed 60s, 16 CSPRNG source seed groups, source seats, policy flags, printed deck identity and 260-root cap. It added **a source-owner next-turn public-energy observation** to the existing physical-card custody gate; there was no new policy or deck mutation.

- [Successful manual CI 41323190263](https://github.com/FlareZ123/experiment-01/actions/runs/41323190263), source head `423e1b5d03edc7eb18fb83caf10cf5eba13fc5bc`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Artifact 13090795396](https://github.com/FlareZ123/experiment-01/actions/runs/41323190263/artifacts/13090795396), ZIP SHA256 `5f16d3db23aa99445a702c9d0eb3aed6647e932c1318d1c6fe3348f4c74a286e`, contains full `agent4-crossrank-four-source-flare.json`.
- Prior exact physical [CI 41233975688](https://github.com/FlareZ123/experiment-01/actions/runs/41233975688), artifact 13054888068 ZIP SHA256 `23743de4b2936c1b072c8edc0f839371f4606740d92081151b4d64af15bc8cf8`.
- Independent Python JSON comparison: **all 32 pair IDs and samePhysicalStart flags**, original source first-deal fingerprints, original root SHA, alternative root SHA, first causal difference index, control and treatment statuses, engine winner fields, and second opposing Energy removal flags **exactly match** the 31 October physical replay; zero mismatches. All 32/32 control and 32/32 treatment `controlPhysicalZone/treatmentPhysicalZone.status` remain `SETTLED_PHYSICAL_INTEGRITY_PASSED`, with zero `pendingRootAnomalies`, no original driver errors and zero changed engine winners. **These are the same physical sample and should never be counted twice.**

## First source Team Flare choice and next original source owner root

Of 32 original matched pairs, **15** had one actual original Store Team Flare substitution, accepted prompt and genuine Energy discard. These represent **11** distinct source first-deal fingerprints. The other 17 pairs remain represented as no selected substitution.

The native observation is actor-owned: it reads the source's own held Plumeria index, `card.canPlay` in that real root, and only the opponent's **public** Active/Bench Energy from a detached `actorObservation`. It occurs at the **first later actual source owner root**, before the source policy selects the next action. No candidate opponent concealed hand, Prize cards or deck composition are passed to this policy observer.

| Opponent Energy publicly attached when the original source selected Team Flare | Selected pairs | Opponent public Energy at first subsequent source owner root | Plumeria native-playable at that root | Second physical Energy removal completed |
| --- | ---: | --- | ---: | ---: |
| Active 1, Bench 0 | **11** | **Active 0, Bench 0 in all 11** | **0/11** | **0/11** |
| Active 2, Bench 0 | **2** | **Active 1, Bench 0 in both** | **2/2** | **2/2** |
| Active 3, Bench 0 | **1** | **Active 2, Bench 0** | **1/1** | **1/1** |
| Active 5, Bench 0 | **1** | **Active 4, Bench 0** | **1/1** | **1/1** |
| **All** | **15** | **Initial public total minus exactly one** | **4/15** | **4/15** |

The 11 single-Energy cases all continued with the original source **still holding Plumeria**, with `nativePlumeriaCanPlay:false`, and 0 public opposing Energy anywhere in play. All four multiple-Energy cases continued with the original source holding and native-canPlay Plumeria, the policy physically selecting `PlayCardAction Plumeria BUS`, the original Store accepting an actual two-card owner hand payment and discarding a second opposing Psychic Energy. In one of the 11 zero-Energy cases the first next source root selected a **Mimikyu PAL Pokémon** play; the others selected Pass. The zero-Energy outcomes thus cannot be attributed to lost Plumeria access.

**New narrower causal explanation of the archived branches:** In these exact observed continuations, Team Flare stripped the sole public Energy and **none was attached to an opponent's Pokémon by the source's immediately subsequent turn**. Therefore Plumeria could not be played for an Energy discard. When the opponent's Active had two or more Energy before Flare, at least one remained continuously accessible at that subsequent source root, and the original source was able to spend a second Supporter turn and two payment cards for another denial. This statement is about these logged public boards and immediate source-owner roots. It does **not** establish that these results generalize to competent attackers, different starting Energy positions, manual reattachment, Bench switching, late game, or a different source policy.

## Qualification and strategic implication

The **observational 0/11 vs 4/4** split was not randomized by initial Energy quantity, deck, turn or match-up. The opponent did not reattach Energy in the 11 zero cases under the existing developmental policy; that is a strong bot-competence caveat and may conceal the actual utility of spending the second Supporter turn. The outcomes remain **5/32 matching engine terminals and 27/32 matching action caps**, **zero changed engine winners**. The native settled physical-zone predicate passed, but general `PROMPT_PAPER_UNVERIFIED` remains applicable outside specific Team Flare/Plumeria original printing receipt checks. No official timed match, hidden-information-safe common two-seat player, or competitive qualification exists.

A useful hypothesis for the **canonical** owner-only decision policy is to evaluate total public opposing Energy supply and opponent reattachment risk before spending Team Flare now to preserve Plumeria for a possible next turn. The first-second denial sequence costs another Supporter opportunity and two hand cards in the observed positive cases; the second-removal probability must be demonstrated against actual opponent responses. This finding **does not justify any change to the fixed candidate 60**, and the overall research benchmark remains 29/32 authenticated exact original opponent 60s, zero competitively qualified games and no demonstrated 99.5% rate.
