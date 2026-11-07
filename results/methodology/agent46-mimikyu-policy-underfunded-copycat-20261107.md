# Agent 46: SimpleTacticsAi rejects underfunded and attack-locked Mimikyu Copycat

**7 November 2026 | Agent 46 | Manual workflow 42358715870**

## Question

The Apex/Timeless Copycat tactic checks public situation conditions and proposes `AttackAction(player.id, 'Copycat')` without checking attached Energy itself. Does Twinleaf's real `SimpleTacticsAi` validate that proposal before selecting it, or can an underfunded Copycat reach the returned action?

## Method

The native runner is [agent46-mimikyu-policy-underfunded-native.cjs](../../simulation/twinleaf/agent46-mimikyu-policy-underfunded-native.cjs). It constructs the pinned `SimpleTacticsAi` with the actual `allSimpleTactics`, `allPromptResolvers`, state scores and arbiter options. It applies `withCopycatApexTimelessPolicy` and instruments the actual custom tactic's `useTactic` method to capture its proposal.

For both physical seats, it stages the visible policy conditions:

- Active Mimikyu GRI;
- preceding opponent attack record from Regidrago VSTAR's non-GX Apex Dragon;
- Dialga-GX in the owner's discard;
- GX attack unused;
- no other hand or Bench action that could preempt the specialized tactic.

It tests three branches: one Psychic Energy with no lock, two Psychic Energy with Mimikyu's next-turn attack lock set, and two Psychic Energy with no lock. Each invalid branch is compared with the unmodified default `SimpleTacticsAi`.

## Result

<badge color="success">Passed</badge> Both physical seats pass underfunded rejection, attack-lock rejection, and funded positive control.

| Branch | Tactic proposal | Simulator validation | Final policy selection |
| --- | --- | --- | --- |
| One Psychic Energy, unlocked | Copycat AttackAction proposed | Rejected for insufficient Energy | Same action as unmodified default bot; not Copycat |
| Two Psychic Energy, attack-locked | Copycat AttackAction proposed | Rejected with `BLOCKED_BY_EFFECT` | Same action as unmodified default bot; not Copycat |
| Two Psychic Energy, unlocked | Copycat AttackAction proposed | Accepted | Copycat selected |

The specialized tactic is invoked exactly once while its public situation predicate is true in all three branches. With one Psychic Energy, the common `SimpleTacticsAi.isValidAction` gate rejects the proposal for insufficient Energy. With two Psychic Energy and the next-turn lock set, the same tactic still proposes Copycat because its public predicate does not inspect the lock; the Simulator rejects it with `BLOCKED_BY_EFFECT`. Both invalid branches fall through to the same action as the unmodified default bot. With two Psychic Energy and no lock, the proposal is accepted and selected. These controls establish that the common action gate protects both Energy and effect restrictions.

## Source-level explanation

Pinned source: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

In `vendor/twinleaf/ptcg-server/src/simple-bot/simple-tactics-ai.ts`, `decodePlayerTurnAction` asks each tactic for an action and then calls `isValidAction(state, action)` before returning it. `isValidAction` constructs a `Simulator(state)`, dispatches the proposed action, and treats an exception as an invalid action. The custom tactic is therefore invoked before the common legality check, while its proposal is validated before it can become the bot's chosen action.

This means the current policy is safe against underfunded and attack-locked Copycat proposals being selected as final actions. Its situation predicate omits both attached-Energy and next-turn-lock checks, so the common validator performs an unnecessary speculative simulation in those branches. Adding local predicates could improve efficiency; no correctness repair is required for these tested paths.

## CI and provenance

- Workflow: existing manual-only `.github/workflows/agent46-copy-delegation.yml`.
- Initial underfunded/funded run: [42358715870, success](https://github.com/FlareZ123/experiment-01/actions/runs/42358715870).
- Expanded underfunded/locked/funded policy step: [42360502325](https://github.com/FlareZ123/experiment-01/actions/runs/42360502325), step 23 passed.
- Expanded policy test source was present in commit `f91888a702420b5d9ffe7e7f4e9ee2ff22c42607`.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Node.js: `20.19.0`.

The previous run `42358373053` tested an earlier assertion that incorrectly rejected every AttackAction. It failed because the underfunded bot correctly fell through to another legal attack. The assertion was corrected to check that Copycat was not selected and that the result matched the unmodified policy. The subsequent full workflow passed.

## Limitations

The opponent Apex Dragon history, board, and discard preconditions are staged. This test validates the policy dispatch and action-legality boundary, not a naturally shuffled game, a full original 60, the strategic quality of the alternative action, or a competitive win rate. Qualified competitive games remain zero.

**Conclusion:** The common Twinleaf SimpleTacticsAi dispatcher rejects both underfunded and attack-locked specialized Copycat proposals before final action selection. Local Energy and lock predicates could avoid wasted simulations, while the tested common validator already preserves action legality.



## Headless integration boundary

This isolated legality runner calls `withCopycatApexTimelessPolicy` directly so it can instrument the real tactic and Simulator without introducing the separate hook behavior into the test. The production research wrapper has an additional fail-closed dependency guard: `simulation/twinleaf/headless.cjs` rejects `mimikyuApexTimelessPolicy:true` unless all four opt-in rule-history flags are true:

1. `mimikyuApexCopycatCompatibility`
2. `mimikyuDeclaredHistoryCorrection`
3. `regidragoDeclaredHistoryCorrection`
4. `passClearsLastAttackCorrection`

The wrapper installs those hooks before creating the game and restores them after the run. This integration contract already has a dedicated regression in [mimikyu-headless-hook-options.test.cjs](../../tests/mimikyu-headless-hook-options.test.cjs), which verifies the opt-in policy metadata, prototype restoration, and rejection of an incomplete request. The underfunded test complements that contract by validating the actual SimpleTacticsAi action-selection gate.
