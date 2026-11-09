# Rank-11 opponent: Quick Ball before Psychic is a complete same-turn line

**Agent 2, 9 November 2026. Outcome: the attack-first source policy changes one genuine accepted root, skips a real Quick Ball + Crobat V line, and changes no native winner. Do not promote attack-first from this fixture.**

## What the original 32-attempt v2 record actually proves

The prospectively registered [Agent8 source Quick Ball / Mail v2 study](agent8-source-policy-fourway-v2-native-20261109.md) found original rank-11 Absol/Garbodor playing Quick Ball at native root ordinal **100**, turn **22**, when its original control had a payable Psychic attack at that root.

The complete archived [v2 native ledger, CI 42545804391, artifact 13643482131](https://github.com/FlareZ123/experiment-01/actions/runs/42545804391/artifacts/13643482131) shows what followed: the source paid and searched with Quick Ball through owner prompts **101–105**, played **Crobat V at ordinal 106**, then used **Psychic at ordinal 107 on the same turn 22**. The source finished with all six Prizes; the candidate took none. Quick Ball delayed the attack by seven accepted Store actions and established a Benched Pokémon before attacking. **It did not cost the attack that turn.**

A first-action-only comparison that calls this a missed attack gets the tactical opportunity cost wrong. The more relevant choice is between the Quick Ball resource and Bench development before the same attack versus attacking immediately with fewer cards expended and fewer board resources established. The specific future value of the Benched Crobat is undemonstrated.

## Replay of an existing source-only priority switch

Rather than inventing another root rule, we tested the already existing, default-off `sourceQuickBallPreservePayableAttack` option. It passes through the canonical `agent41-bilateral-v2-development.cjs` and gates `quickBallPayableAttackPriority` on the actual original-source physical seat in `agent34-actor-only-root-policy.cjs`. The selected 60s and original fixed seeds stayed unchanged.

- [Native runner](../../../simulation/evaluation/2026-11/agent2-rank11-source-quickball-attack-priority.cjs), [nine passing unit regressions](../../../tests/2026-11/agent2-rank11-source-quickball-attack-priority.test.cjs).
- Rank-11 source target: registered `11:3202:A`, seed `849373371`, and `11:3203:B`, seed `3592222510`.
- Original rank-13 registered control games `13:3204:A` and `13:3205:B` supply the shared release wrapper's mandatory four distinct trials. No seeds were added after reviewing the replay outcomes.
- Native pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, action limit 260, both original physical-seat orientations.
- [Successful complete native CI 42555173335](https://github.com/FlareZ123/experiment-01/actions/runs/42555173335), [raw eight-attempt artifact 13646798762](https://github.com/FlareZ123/experiment-01/actions/runs/42555173335/artifacts/13646798762). Nine pure tests passed and the actual native comparison ended successfully.

| Original matchup and candidate seat | First accepted source-policy difference | Natural native outcome in control and guard |
| --- | --- | --- |
| Rank 11, A | None, identical accepted roots | Original source wins both, 6–0 Prizes |
| **Rank 11, B** | **Source ordinal 100: Quick Ball becomes Psychic** | **Original source wins both, 6–0 Prizes** |
| Rank 13, A control | None, identical accepted roots | Original source wins both, 6–0 Prizes |
| Rank 13, B control | None, identical accepted roots | Candidate wins both, 6–0 Prizes |

**Native evidence:** all **4/4** full and original-source deal fingerprints matched across policies. All **8/8** native attempts naturally terminated. The first changed accepted root was source-owned and occurred in the rank-11 candidate-seat-B fixture only. The other three registered pairs were inactive. There were **zero** native winner changes and **zero** competitively qualified paper games.

In the affected rank-11 B source game, the default search-first policy played one actual Quick Ball and then Crobat V before Psychic on turn 22. The guarded attack-first policy used Psychic immediately, skipped that Quick Ball and Crobat placement on turn 22, and still used **12 Psychic attacks** across the completed game. Both native games ended at source six Prizes to candidate zero. Their full root counts were 148 and 139 respectively. These facts do not demonstrate that one ordering gives the original source a higher expected real-game win rate.

## Practical decision

**Retain the existing Quick Ball-before-attack behavior for this tested context pending a consequential counterexample.** The new attack-priority option correctly changes the source's physical accepted decision, but its isolated action change has no observed win benefit. It can suppress a same-turn search and Bench development line while preserving the same attack count.

For future adversarial opponent policies, evaluate the **complete remaining own-turn action chain** before classifying an early search as displacing an attack. Useful comparisons should preserve resource payments and the next owner choice, then look for meaningful follow-on board, lock or Prize consequences. This finding prevents a tempting immediate-root arbitration from being mischaracterized as a strength improvement.

**Scope:** retrospective tactical falsification using already-published deals; original printing inventories as admitted by the native runner. No random prospective win-rate evidence, no paper tournament-clock qualification, no final fixed 60. The full Aichi benchmark still has only **29/32** authenticated original sixties; ranks 23, 25 and 28 remain unavailable. The 99.5% target is unsupported.
