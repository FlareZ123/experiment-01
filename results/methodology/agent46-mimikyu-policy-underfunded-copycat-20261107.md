# Agent 46: SimpleTacticsAi rejects underfunded Mimikyu Copycat

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

It then compares one Psychic Energy against two Psychic Energy. The same state is also evaluated by the unmodified default `SimpleTacticsAi` for the underfunded branch.

## Result

<badge color="success">Passed</badge> Both physical seats pass underfunded rejection and funded positive control.

| Branch | Tactic proposal | Simulator validation | Final policy selection |
| --- | --- | --- | --- |
| One Psychic Energy | Copycat AttackAction proposed | Rejected | Same action as unmodified default bot; not Copycat |
| Two Psychic Energy | Copycat AttackAction proposed | Accepted | Copycat selected |

The specialized tactic is invoked exactly once while its public situation predicate is true in both branches. With one Psychic Energy, the common `SimpleTacticsAi.isValidAction` gate constructs a `Simulator`, dispatches the proposed action, and rejects it when the Store rejects the attack for insufficient Energy. The tactic loop then continues. The final action is identical to the baseline bot's action.

With two Psychic Energy, the same proposal is accepted and selected. This positive control establishes that the policy tactic remains active when Copycat is actually payable.

## Source-level explanation

Pinned source: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

In `vendor/twinleaf/ptcg-server/src/simple-bot/simple-tactics-ai.ts`, `decodePlayerTurnAction` asks each tactic for an action and then calls `isValidAction(state, action)` before returning it. `isValidAction` constructs a `Simulator(state)`, dispatches the proposed action, and treats an exception as an invalid action. The custom tactic is therefore invoked before the common legality check, while its proposal is validated before it can become the bot's chosen action.

This means the current policy is safe against an underfunded Copycat being selected as the final action. Its missing Energy predicate can still cost an unnecessary speculative simulation. Adding a local predicate would be a possible efficiency improvement, not a correctness repair demonstrated by this test.

## CI and provenance

- Workflow: existing manual-only `.github/workflows/agent46-copy-delegation.yml`.
- Run: [42358715870, success](https://github.com/FlareZ123/experiment-01/actions/runs/42358715870).
- Tested repository commit: `9077fc49190f47434542a9e14ca9f5a7dc69d276`.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Node.js: `20.19.0`.

The previous run `42358373053` tested an earlier assertion that incorrectly rejected every AttackAction. It failed because the underfunded bot correctly fell through to another legal attack. The assertion was corrected to check that Copycat was not selected and that the result matched the unmodified policy. The subsequent full workflow passed.

## Limitations

The opponent Apex Dragon history, board, and discard preconditions are staged. This test validates the policy dispatch and action-legality boundary, not a naturally shuffled game, a full original 60, the strategic quality of the alternative action, or a competitive win rate. Qualified competitive games remain zero.

**Conclusion:** The common Twinleaf SimpleTacticsAi dispatcher rejects an underfunded specialized Copycat proposal before final action selection. The policy does not currently need an extra Energy predicate for correctness, though one could avoid wasted simulation work.



## Headless integration boundary

This isolated legality runner calls `withCopycatApexTimelessPolicy` directly so it can instrument the real tactic and Simulator without introducing the separate hook behavior into the test. The production research wrapper has an additional fail-closed dependency guard: `simulation/twinleaf/headless.cjs` rejects `mimikyuApexTimelessPolicy:true` unless all four opt-in rule-history flags are true:

1. `mimikyuApexCopycatCompatibility`
2. `mimikyuDeclaredHistoryCorrection`
3. `regidragoDeclaredHistoryCorrection`
4. `passClearsLastAttackCorrection`

The wrapper installs those hooks before creating the game and restores them after the run. This integration contract already has a dedicated regression in [mimikyu-headless-hook-options.test.cjs](../../tests/mimikyu-headless-hook-options.test.cjs), which verifies the opt-in policy metadata, prototype restoration, and rejection of an incomplete request. The underfunded test complements that contract by validating the actual SimpleTacticsAi action-selection gate.
