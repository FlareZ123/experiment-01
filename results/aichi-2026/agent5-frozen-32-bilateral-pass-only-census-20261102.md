# Agent 5: preregistered 32-game original-Store bilateral pass-only episode audit

**2 November 2026.** Retrospective **read-only secondary analysis** of an already registered experiment. No added game samples, card swaps, policies, action dispatches or new CI jobs. **Zero competitively qualified games.**

## Question

The original rank-9 Absol/Electrode study discovered a prolonged 19-Joust/21-opponent-Pass loop. Do independent, previously preregistered rank-6 and rank-11 source games also contain long stretches where **both** automated physical seats take only their ordinary end-turn action, without actually playing a card, retreating, using an Ability or declaring an attack?

These loops are an evaluation-policy failure **review signal**, subject to ordinary strategic waiting, resource availability, owner information and the official paper clock. A pass-only episode alone cannot prove a better action was legally or strategically available.

## Frozen input and independently audited bytes

Original completed 32-arm preregistration and report: [Agent41, 29 October](agent41-prospective-canonical-scout-native-20261029.md). Original native [manual CI run 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683); archived [artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), file `agent41-prospective-canonical-32.json`.

* Independently verified ZIP SHA-256: `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`.
* Independently verified uncompressed raw JSON SHA-256: `d1f0b3663121592f3cf41a022f648cacff7e99fc3b74ee05cf54cbdea26984d7`.
* Native Twinleaf pin in original report: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; original source printed ranks **6 Iron Thorns** and **11 Absol/Garbodor**, fixed champion-reference and New Moon Lockbreaker v1 candidates, both physical candidate seats with four trial groups per rank, 32 unchanged arms. **Original preregistration and experiment were not performed by Agent5**; this is a posterior analysis of its already-public evidence.
* All **32/32** full root ledgers pass exact `rootActionCount === rootActionLedger.length` and consecutive `actionOrdinal` checks. All **32/32** report no native sudden-death reset and no backward `turnAfter < turnBefore` reset. Preserve every terminal and action-cap row in the denominator.

## Definition and falsification guards

An observed global turn is **pass-only** if its entire original Store accepted-root sequence contains exactly one non-`ResolvePromptAction`, and that root is `PassTurnAction`. Every `ResolvePromptAction` belonging to the turn must have `pendingPrompt === 'WaitPrompt'`; any non-Wait choice prompt, Card play, Attack or Retreat vetoes this classification. Setup turn zero is excluded.

A **bilateral pass-only episode** is a run of consecutive numbered global turns individually passing that strict filter, with **alternating physical player seats**. A missing intermediate turn or same-seat duplicate splits the episode. Review flag requires at least **10** consecutive turns, an ordinal-complete ledger, and a single unreset game episode. No estimated strategy quality or winner inference is attached to the flag.

Reusable [read-only analysis](../../scripts/aichi-bilateral-pass-loop-census.cjs) and [four-case synthetic regression](../../tests/aichi-bilateral-pass-loop-census.test.cjs) were executed locally under Node 22 with **4/4 passing**. The script accepts the original archived `developmentResult.rows` as input; it requires no modified Twinleaf or opponent data access.

## Failure-inclusive archived 32-game result

| Original source rank | Fixed candidate | Games | Strict pass-only turns | Games with >=5 consecutive alternating pass-only turns | 10+ review episodes |
| --- | --- | ---: | ---: | ---: | ---: |
| 6 Iron Thorns | Champion reference | 8 | 135 | 2 | 0 |
| 6 Iron Thorns | New Moon v1 | 8 | 251 | 5 | 4 |
| 11 Absol/Garbodor | Champion reference | 8 | 87 | 1 | 1 |
| 11 Absol/Garbodor | New Moon v1 | 8 | 130 | 3 | 0 |
| **Full frozen 32** | Both unchanged inventories | **32** | **603** | **11** | **5 episodes in 4 games** |

Rank-6 New Moon has four 10+ episodes spread across **three** games; the four distinct game maxima below are the admission unit. Both candidate inventories share original source seed groups, so 32 arms are **not 32 independent source deals**. In the full set, **11/32 games** reach a 5-turn episode, **4/32 games** reach a 10-turn episode. The 603 pass-only turns are serial observations within games, not independent gameplay trials.

### Four most prolonged original-Store physical episodes

| Source, trial | Candidate | Consecutive turns | Exact global turns | Source pass-only turns | Candidate pass-only turns | Archived outcome |
| --- | --- | ---: | --- | ---: | ---: | --- |
| `6:2:B:new-moon-lockbreaker-v1` | New Moon | **18** | 40–57 | 9 | 9 | Engine terminal, Prizes [6,2] |
| `6:3:A:new-moon-lockbreaker-v1` | New Moon | **16** | 8–23 | 8 | 8 | Engine terminal, Prizes [0,6] |
| `6:0:B:new-moon-lockbreaker-v1` | New Moon | **11** | 3–13 | 6 | 5 | Engine terminal, Prizes [6,4] |
| `11:0:A:champion-reference` | Champion | **10** | 8–17 | 5 | 5 | Engine terminal, Prizes [0,6] |

Prizes are archived physical seat A,B, **not** normalized wins. All engine terminals in this table remain competitively unqualified. The historical 32 arms also include **12 action limits** and **20 engine terminals**, **zero native exceptions**, as reported in the original registration; this audit preserves them without assigning censored games a winner.

### Trace spot-check, longest episode

The actual original rank-6 Iron Thorns game `6:2:B:new-moon-lockbreaker-v1` has source seat A and candidate seat B. On each consecutive global turn **40 through 57**, the entire native action ledger records Wait prompt, Pass root, Wait prompt, with alternating physical seats. On turn **39**, the source played Iron Thorns ex before passing; turn 39 is correctly excluded. On turn **58**, candidate played Fog Crystal, settled a real ChooseCards/ShowCards/ShuffleDeck chain, attached Psychic Energy and declared Night Watch; turn 58 is correctly excluded. The complete 18-turn span therefore demonstrates a long genuine both-seat idle segment, **not** a permanent engine deadlock.

## Consequence for the deck-optimization decision

The archived result supports a precise review of policy coverage and apparent tempo, especially rank-6 New Moon. It **does not show** that one player held a payable attack, that a relevant Trainer was in hand, that alternative action was desirable under an Item/Ability lock, or that the simulated elapsed turns could occur under the event's paper time limit. Such questions require owner-visible state and accepted native alternate actions, then a consequential opposing response.

**Recommendation to shared release owners:** include the opt-in `passiveEpisodeCensus` read-only gate alongside actual attack settlement, source-line conversion and card-play coverage. Before interpreting future rank-6/11 engine terminals as fixed-60 strength, inspect and explain ≥10-turn bilateral inactivity episodes, then test concrete legal owner-only alternatives. This is an additive regression and evidence-audit facility. No canonical policy or candidate 60 has been changed.

The full Aichi benchmark still has **29/32** authenticated original opposing sixties, missing **23, 25 and 28**. **Zero competitive-qualified games and no demonstrated 99.5% field win rate.**
