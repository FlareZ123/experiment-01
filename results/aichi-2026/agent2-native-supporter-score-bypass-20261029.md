# Frozen canonical actor policy bypasses native Supporter scoring

**Agent 2, 29 October 2026.** The [compiled 40949229817 manual workflow](https://github.com/FlareZ123/experiment-01/actions/runs/40949229817) **PASSED** at exact SHA `77de49bb7ffeaabc0a36f712cb2e8faf4e82cbc4`. The [native score artifact 12929423871](https://github.com/FlareZ123/experiment-01/actions/runs/40949229817/artifacts/12929423871), ZIP SHA256 `5cf95ffd1357af74925a4dcb36eb074a8959f344eab1562e9631305f963b6b1d`, is machine-readable. Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Question

Does the canonical owner-only actor policy produce zero candidate Supporter plays because native `PlaySupporterTactic` evaluates playable Supporters unfavourably, because native simulator evaluations fail, or because native tactic scoring is absent from the actual decision path?

## Method

[Native Supporter score-disposition observer](../../simulation/twinleaf/agent2-native-supporter-score-disposition.cjs) reversibly wraps exactly four pinned methods: `SimpleTacticsAi.decodeNextAction`, `PlaySupporterTactic.useTactic`, `SimpleTactic.evaluateAction` and `SimpleTactic.getStateScore`. All pre-existing methods execute exactly once. Evaluated card printing, score and baseline threshold are collected only on real bot decisions. No extra simulation, action, prompt or random choice is requested. [Three pure regressions](../../tests/agent2-native-supporter-score-disposition.test.cjs) verify positive/negative thresholds, undefined simulation scores and exact restoration after native error.

[Historical noninterference smoke](../../simulation/twinleaf/agent2-native-supporter-score-samedeal-smoke.cjs) compared unobserved versus observed original-Store replay on the exact precommitted rank6 repeat2/A source-first deal, both original candidate 60s and frozen policy options including `actorOnlyComposition:true`.

## Result

- **196 authentic native `decodeNextAction` calls observed** across the two historical games.
- **0** invocations of the upstream `PlaySupporterTactic.useTactic` were observed.
- Consequently **0 native supporter candidate score evaluations** and **0 score-disposition Pass records** existed in the observer's output.
- Original versus observed accepted root action hashes, physical source deal, action count, terminal/cap statuses and winners all matched exactly. Both pure and live compiled tests passed.

The upstream scorer was **not reached** within these canonical actor-only games, which rules out unfavourable native evaluation scores as the *direct* explanation for their missing candidate Supporter roots. This aligns with Agent 24's [actor-only action-vocabulary audit](../twinleaf/agent24-canonical-actor-supporter-action-space-20261029.md) and the Critic's [field-wide policy integration directive](../../communications/broadcast/20261029T194107Z_critic_fieldwide_action_vocabulary_gate.md). It does not establish what the native scorer would do in a different policy composition where its `PlaySupporterTactic` actually executes.

The independent [real-Store owner-only Supporter opportunity audit](agent2-native-owner-supporter-opportunity-20261029.md) recorded 50 accepted Pass decisions after the first-global-turn stage, across these same two games, with at least one held native-null-`canPlay` positive Supporter. Therefore the immediate integration priority is a **central, actor-observation-safe, both-seat Supporter selector with native prompt and outcome settlement**. Tuning native `supporterBonus` is irrelevant while the canonical actor composition does not call that scorer.

## Qualification

The two replayed arms were selected historically. This is an exact decision-path instrumentation result, not evidence of card strategic value, legal targets, policy generality or improved win rate. The full Aichi source coverage remains 29/32 and competitively qualified games remain zero.
