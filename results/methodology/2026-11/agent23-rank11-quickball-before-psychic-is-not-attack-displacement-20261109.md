# Original rank11: Quick Ball before Psychic was a same-turn sequence, not a lost attack

**Agent23, 9 November 2026.** This is a completed source-policy falsification, not a card substitution, held-out competitive result, or proof of original-source optimal play.

## Causal question

Agent8's source-challenger v2 had identified an apparently contentious native root: original rank11 source seat 0 played **Quick Ball** at Store root ordinal 100 instead of the root that would have attacked with **Psychic**. We asked whether choosing the payable attack first improves *actual source actions, Prize result or game outcome*, rather than merely changing the first root action.

I added a default-off, owner-only source option `sourceQuickBallPreservePayableAttack` through the existing native actor root. When enabled, the actor checks the same printed-payable attack branch before its optional Quick Ball. If no native-payable attack is available, Quick Ball retains its original position. All earlier setup options, source/candidate decks, native Store, decision policies and mandatory-owner prompts remain unchanged.

## Actual native experiment

Pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compilation successful, CI [run 42554121744](https://github.com/FlareZ123/experiment-01/actions/runs/42554121744), immutable ZIP artifact ID **13646971512**, SHA-256 `283bf8d97d007fd70e5486fdddac3ecd608e90245ed1c5767199acbfc7d95190`.

Four already preregistered authentic source/candidate 60s with fixed physical seeds: original rank11 versus fixed New Moon, candidate A/B seeds 3202/3203; original rank31 versus same candidate, A/B seeds 3206/3207. The experimental factors are candidate Perfection transition on/off × original-source Quick Ball priority on/off. **16 real Store attempts**, all 16 natural native terminals, zero errors or action-cap censoring. All eight matched Q0/Q1 pairs have identical full and source physical-deal fingerprints. Every actual winner and final Prize count is unchanged by the Quick Ball priority. All eight comparison pairs are retained in the archived raw JSON. Pure source-owner/native-schema suite [42554117469](https://github.com/FlareZ123/experiment-01/actions/runs/42554117469) also succeeded.

| Original source, seat | Candidate pivot | Source Q0 then Psychic | Source Q1 attack-first | Native result |
| --- | --- | --- | --- | --- |
| Rank11, source seat0, seed 3203 | Off | 1 Quick Ball, **12 Psychic attacks**, 148 Store roots | 0 Quick Balls, **12 Psychic attacks**, 139 Store roots | Source wins, final Prizes [0,6] in both |
| Rank11, source seat0, seed 3203 | On | 1 Quick Ball, **12 Psychic attacks**, 148 Store roots | 0 Quick Balls, **12 Psychic attacks**, 139 Store roots | Source wins, final Prizes [0,6] in both |
| Rank11, source seat1, seed 3202 | Off and on | 0 Quick Balls, 7 attacks, 209 roots | Identical | Source wins, final Prizes [6,0] |
| Rank31, source seat1, seed 3206 | Off and on | 0 Quick Balls, 0 attacks | Identical within candidate factor | Candidate wins, final Prizes [0,6] |
| Rank31, source seat0, seed 3207 | Off and on | 0 Quick Balls, 0 attacks | Identical within candidate factor | Candidate wins, final Prizes [6,0] |

The decisive rank11-B Q0/Q1 native first difference is **accepted source root ordinal 100, global turn 22**, Quick Ball versus AttackAction Psychic. **Under Q0 the source also attacks with Psychic on global turn 22.** In fact, the source performs its 12 attacks on identical turns **10,12,14,16,18,20,22,24,26,28,30,32** in both Q0 and Q1. The extra nine roots in Q0 are from the intervening Item/sequencing continuation; those roots do not displace the attack or turn, and no game-result reversal occurs.

## Operational conclusion

**Do not promote attack-before-Quick-Ball as a source-policy improvement on this evidence.** In the observed native encounter, it merely suppresses an additional Item action that the old policy completed **before executing the very same attack on the very same turn**. A first-root ordinal mismatch is insufficient to diagnose actual attack loss. No source win-rate increase, defensive capacity change or paper qualification has been demonstrated.

The default remains Q0; Q1 is retained only as a reproducible opt-in policy counterfactual. The next genuinely useful source-policy improvement should follow the **Quick Ball payment, live owner deck-search target, resulting Bench/lock and later attack outcomes**. Compare alternatives that actually change an adversarial response, avoid treating additional native action counts as intrinsically beneficial, and include source K1 Prize information only after a real deck search. This is a stronger next line than suppressing Item play before an already paid attack.

Source code: `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, `simulation/evaluation/agent41-bilateral-v2-development.cjs`, `simulation/evaluation/2026-11/agent23-rank11-source-quickball-vs-attack-native.cjs`. Relevant pure tests: `tests/agent23-quickball-payable-attack-arbitration.test.cjs`, `tests/agent23-rank11-source-quickball-attack-native-contract.test.cjs`.

**Full Aichi benchmark:** 29/32 exact original source decks authenticated, ranks 23/25/28 missing, no competitively paper-qualified games or nominated fixed 60 at 99.5%.
