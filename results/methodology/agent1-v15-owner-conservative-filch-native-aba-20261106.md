# Agent 1: conservative owner Filch counterfactual reverses one unqualified native source win

**6 November 2026. Precommitted, source-independent opponent-policy sensitivity test; not a competitive benchmark.** Directly follows the [v14 eight-trial 260-root native terminal-cause audit](agent1-v14-native-original-eight-terminal-cause-audit-20261106.md), which found two original rank11 source victories attributed to a Champion contender repeatedly drawing with Mimikyu's *Filch* until its own deck exhausted.

## Precommitment and native implementation

The [v15 registration](../aichi-2026/registrations/agent1-v14-v15-bilateral-conservative-filch-20261106.md) was committed **before any v15 native gameplay**. It fixes the exact historical eight source/candidate original-rank6/rank11 trials, existing official printed 60s and physical seats, each initial seed, pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, untouched v13 card policies, 260 accepted-action root cap, and **A/B/A** evaluation order. No newly sampled or post-selected favorable trial was added.

Only B adds [owner-symmetric native Filch guard](../../simulation/twinleaf/agent1-conservative-owner-filch.cjs) inside the actual per-match native `SimpleTacticsAi.prototype.decodeNextAction` decision. If the original policy selected the printed **Mimikyu `AttackAction Filch`** while the acting player had **24 or fewer cards in their own deck**, it returns a legal native `PassTurnAction` for that **same acting owner**. Other card choices and all owner seats remain governed by the original policy. Threshold 24 came from [Agent2's earlier fixed original rank3 anti-Filch sensitivity test](agent2-original-rank1-conservative-filch-response-aba-20261104.md). The new guard never inspects opposing concealed card identities, Prize contents or owner private card names. It is deliberately a weak conservative policy, not an independently competent strategic player.

The [native comparison runner](../../simulation/evaluation/agent1-v15-bilateral-filch-conservation-aba.cjs) accepts all eight native trials per arm, compares full physical opening and source deal fingerprints, asserts exact A versus A' accepted root action and native outcome replay, and joins every attempted replacement to a **genuine accepted original Store `PassTurnAction`** at same owner seat/global turn. Its latest comparator also separately refuses certification unless the **first changed root** in each affected trial is exactly original A `AttackAction Filch` versus B native owner `PassTurnAction`, with complete unchanged public prefix before that root.

## Native CI and immutable artifact

[Original 24-attempt pinned compiled run 42296492665](https://github.com/FlareZ123/experiment-01/actions/runs/42296492665) **SUCCESS**, [artifact 13541229255](https://github.com/FlareZ123/experiment-01/actions/runs/42296492665/artifacts/13541229255). I independently downloaded the ZIP and verified enclosed `agent1-v15-bilateral-filch-aba.json` bytes (3,808,326) against its actual SHA-256 checksum sidecar: **`9df3afb68e694e40fcd5c73f0b924f31243cc5ce56341f03b5e561478fc73e8f`**. The artifact includes every root of the 24 attempted games, all caps and errors and each per-native-owner policy audit. Frozen input source/candidate opening fingerprints matched **8/8** in all three arms, and A/A' completed with byte-identical root ledgers and winner/status outcomes for **8/8**.

The original run's complete first divergent native root sequences were independently inspected from the downloaded JSON:

| Trial | First change | Source rank / original seat | A's original action | B's actual native action | Acting owner deck at proposal |
| --- | ---: | --- | --- | --- | ---: |
| `11:202:A:champion-reference` | 100 | Rank11 / seat1 | `AttackAction Filch` seat0, turn20 | `PassTurnAction` seat0, turn20 | 23 |
| `11:203:B:champion-reference` | 85 | Rank11 / seat0 | `AttackAction Filch` seat1, turn17 | `PassTurnAction` seat1, turn17 | 22 |

Both A/B traces are *identical before* these actual first native owner decision changes. The **six other registered trial ledgers** remain completely identical between A and B.

## Full original eight disposition by arm

All three arms contain exactly eight attempted native matches. Only two are affected; source seat alternates between the two relevant rank11 tests.

| Registered trial | Control A | Conservative B | Control A' |
| --- | --- | --- | --- |
| Rank6 Champion, source seat1 | 260-root cap | Same 260-root cap | Identical control |
| Rank6 New Moon, source seat1 | Source wins by all Prizes at root260 | Identical native game | Identical control |
| Rank6 Champion, source seat0 | Champion contender wins by all Prizes at root154 | Identical native game | Identical control |
| Rank6 New Moon, source seat0 | Engine error root84 | Same engine error | Identical control |
| **Rank11 Champion, source seat1** | **Source deck-out win root163** | **260-root cap, no determined winner** | Identical source win root163 |
| Rank11 New Moon, source seat1 | 260-root cap | Identical native game | Identical control |
| **Rank11 Champion, source seat0** | **Source deck-out win root154** | **Source still wins by deck-out, root252** | Identical source win root154 |
| Rank11 New Moon, source seat0 | 260-root cap | Identical native game | Identical control |

In the first affected trial, control's contender seat0 executed **13** native Filch attacks; B executed **5** and chose **14 accepted conservative Pass** replacements. At B's root260, native report remained censored, with final seat0/seat1 Prizes **[4,5]**, owner deck counts **[1,16]**, so neither native player had exhausted their deck or finished the game. Do not score that cap as a win for either side.

In the second affected trial, control's contender seat1 used Filch **14** times and was decked out by root154; B used **7** Filch, chose **21 accepted Pass** substitutions and still eventually lost by deck exhaustion at root252. Final B Prizes remained [6,6]; the losing contender deck count was **0**. These two observed deltas total **35** actual native owner Pass replacements. Conservative draw suppression prolongs survival in both, while a weak late-game bot can still lose by ordinary draws.

**Native finish disposition:** A = 4 finishes / 3 caps / 1 error; B = **3 finishes / 4 caps / 1 error**; A' = identical to A. Both affected trials' printed physical source/deck lists, initial draw and native rules were identical; the positive effect comes from the single source-independent owner-decision guard.

The native successor decisions **genuinely diverged downstream**. For the `11:202:A:champion-reference` trial, original control recorded 13 contender Filch declarations and **no other contender attack**. Conservative treatment recorded 5 Filch declarations, **3 actual Full Moon Rondo declarations** by the contender, and **9 actual Motivate declarations** by the original source, consistent with a substantially changed board interaction. For `11:203:B:champion-reference`, native source `Terminal Period` attack declarations grew from **2** to **16** as the game extended to root252. These are action declarations and resulting public game progress under a weak bot, and do not by themselves independently certify attack effectiveness, Prize custody or human strategic quality.

## Direct actual-Store terminal-rule verification

A subsequent **read-only** v14/v15 observer captured the engine's existing `headless.runMatch().terminalTransition`: public `before` and `after` snapshots of the genuine Store dispatch that first changed the game phase to FINISHED. The preexisting [terminal-cause classifier](../../simulation/evaluation/terminal-cause-evidence.cjs) independently checks the transition, winner, player turns, public Prize counts, public deck counts and in-play Pokémon totals, allowing several sufficient conditions instead of guessing a unique cause. The adapted v14/v15 runner makes no change to owner game actions or the engine.

[Pinned compiled 24-native original-eight run 42298072832](https://github.com/FlareZ123/experiment-01/actions/runs/42298072832) **SUCCESS**, [artifact 13542443246](https://github.com/FlareZ123/experiment-01/actions/runs/42298072832/artifacts/13542443246). Its enclosed `agent1-v15-bilateral-filch-aba.json` is 3,836,846 bytes with independently verified SHA-256 **`5cb81432f33d07720f61e21c8739b0a4ca40dbea96c1de637805bb27d12f0d65`**, matching its `.sha256` sidecar. All original physical openings, A/A' exact native roots, B first-divergence legal owner Filch-to-Pass and owner-pass settlement checks remain true.

In both A and A' controls, **four of four** FINISHED games have exactly one recorded sufficient native end condition: both rank6 finishes are `winner-took-final-prize`, and both rank11 Champion finishes are `loser-empty-deck-at-new-turn`. For the two latter cases, the actual native terminal `ResolvePromptAction` transition advanced the global turn **35 -> 36** and **30 -> 31** respectively, with the soon-to-draw loser still holding zero deck cards, six Prizes and six Pokémon in play. In B treatment, **all three** FINISHED games have a sufficient Store transition: two rank6 final-Prize finishes, and rank11 source-seat0 empty-deck win at **turn 58 -> 59**. The other rank11 source-seat1 trial remains a 260-root cap and therefore has no end-rule certificate.

These transitions establish native game-end predicates more strongly than postgame final zones alone, while preserving the limitation that paper Expanded card resolution, bot strategy and real match clock remain unqualified.

## Final strict native revalidation

The latest [CI 42298674682](https://github.com/FlareZ123/experiment-01/actions/runs/42298674682) **SUCCESS** additionally required the native test to fail closed unless the real `terminalTransition` classifier verified the *exact preregistered cohort* counts: A and A' each have **2** observed winning final-Prize transitions and **2** losing-owner empty-deck-at-next-turn transitions; B has **2** final-Prize and **1** empty-deck-at-next-turn transition. This verification executes alongside first-native-root exact `Filch -> Pass` identity, all actual Pass settlements and control replay checks. The tests retained all 24 native games, including censored roots and the original native error, without changing any game policy.

[Artifact 13543013001](https://github.com/FlareZ123/experiment-01/actions/runs/42298674682/artifacts/13543013001) provides the complete public-root and transition receipt. Independently downloaded enclosed `agent1-v15-bilateral-filch-aba.json`: **3,839,922 bytes**, SHA-256 **`645bcfac31facbdb797eefa567c3611063f23577fe62ae56fb3e47da40a20893`**, exactly matching its atomic `.sha256` sidecar. Verified 8/8 physical openings, 8/8 unchanged A/A' root repetitions, 35 genuine owner Pass substitutions, and all three arm terminal-condition counts.

## 7 November manual A/B/A replication

The existing eight-trial v15 Filch guard experiment was rerun in [manual workflow run 42362364958](https://github.com/FlareZ123/experiment-01/actions/runs/42362364958), with complete [artifact 13570198885](https://github.com/FlareZ123/experiment-01/actions/runs/42362364958/artifacts/13570198885). The rerun again preserved the same registered physical deals; every A/A-repeat root ledger was identical across all eight contexts. The only two first A/B divergences remained the rank11-versus-Champion-reference trials:

- Rank11 source seat 1: at root 100, control A selected Filch with owner deck 23 and B selected an accepted native PassTurnAction. A reached its deck-out terminal at root 163; B remained action-capped at root 260 with no determined winner.
- Rank11 source seat 0: at root 85, control A selected Filch with owner deck 22 and B selected an accepted native PassTurnAction. A reached its deck-out terminal at root 154; B still reached a deck-out terminal at root 252.
- The other six contexts had no first A/B root divergence.

This replication supports the narrow conclusion that the fixed 24-card guard can delay a weak bot's self-deckout in selected contexts. It does not establish that passing is optimal or that either changed trajectory is a competitive win. The first B trajectory is censored at the 260-root cap; the second still decked out. No game is competitively qualified.

## Certification and interpretation

This is a causally interpretable native **decision-policy sensitivity** witness on two selected original rank11 physical games. The native result does not demonstrate that passing is optimal; it has no competing funded attack, gust, recovery or effective game-clock evaluation. It does establish that source wins previously counted as ordinary engine terminals can be **entirely erased or delayed** by a minimal owner-deck conservation decision, with exact same original physical deals.

None of A/B/A is an independent field-weighted matchup trial. Sources include only original ranks 6 and 11, against two developmental Champion/New Moon 60s and a flawed shared native policy, at an artificial 260-root cap. The Aichi field remains **29/32 authenticated**, with ranks 23/25/28 unavailable as exact opponent inventory; **zero paper-competitive-qualified games** and **no final unchanged deck selected**. There is no supported estimate of performance toward 99.5%.

The actionable methodological lesson for the common-policy steward is to **annotate native wins by mechanism** (Prize closure, own-deck exhaustion, total Pokémon elimination, engine anomaly) and require active adversarial opponent choices before a deck-out native result is eligible for meaningful relative strength ranking. A terminal produced by repeated late-game voluntary Filch draws should be treated as a policy-artifact candidate and must be stress-tested, not promoted to competitive evidence.
