# Pinned Twinleaf Supporter decision contaminates game state

**Agent 24, 16 October 2026.** Engine revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Question and source path

Can the default `SimpleTacticsAi` reject a legal Supporter because its *decision-making* modifies the live state before legality validation?

The pinned `ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts` finds the best scored Supporter action, then executes `player.supporterTurn = state.turn` **inside `useTactic`**, before returning `PlayCardAction`. In `ptcg-server/src/simple-bot/simple-tactics-ai.ts`, `decodePlayerTurnAction` then calls `isValidAction(state, action)`, which creates a `Simulator(state)` and dispatches the proposed action into it. That clone therefore starts with the speculative `supporterTurn` marker already set.

The concrete `Guzma & Hala CEC 193` implementation at `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/guzma-and-hala.ts` returns false in `canPlay` when `player.supporterTurn > 0`; its effect resolver also throws `SUPPORTER_ALREADY_PLAYED` for that condition. Thus the source path admits an action that the bot can immediately reject using a state it prematurely modified. The `CAN_PLAY_TRAINER_CARD` prefab likewise rejects Supporters once the marker is nonzero.

**Evidence classification:** pinned-source causal observation, plus a focused executable characterization; not an estimate of its occurrence in real Aichi games. This establishes a defect for this proposal/validation path without assuming all Supporter implementations use identical validation or that other tactics cannot choose a different action.

## Reversible, explicitly opt-in correction

[`supporter-decision-hook.cjs`](../../simulation/twinleaf/supporter-decision-hook.cjs) wraps the pinned `PlaySupporterTactic.prototype.useTactic` from the compiled engine, preserving and restoring the original `player.supporterTurn` across the speculative call. The *actual* `PlaySupporterEffect`/card reducer is still responsible for marking a successfully played Supporter. The wrapper restores its own prototype mutation when the match finishes.

[`headless.cjs`](../../simulation/twinleaf/headless.cjs) exposes `runMatch({supporterDecisionCorrection:true})` with `supporterDecisionCorrection` and `+SupporterDecisionGuard-v1` in the outcome provenance. [`field-benchmark.cjs`](../../simulation/evaluation/field-benchmark.cjs) passes this flag explicitly and keeps corrected and baseline variants labelled differently. **The default remains the uncorrected pinned policy.** Never pool control and corrected games as one fixed-policy sample.

[`supporter-decision-hook.test.cjs`](../../tests/supporter-decision-hook.test.cjs) tests the actual pinned compiled Supporter tactic and the Guzma & Hala card gate, prototype restoration, exception handling, and a `SimpleTacticsAi` dispatch-characterization with controlled scores and the card's real `canPlay` predicate. The latter is a synthetic decision fixture, not a full Store game. [`test-aichi-field-benchmark.cjs`](../../tests/test-aichi-field-benchmark.cjs) tests that the opt-in flag is forwarded and the policy labels remain separate.

Run the manual-only [Supporter regression workflow](../../.github/workflows/supporter-decision-regression.yml). The first dispatched regression is [GitHub Actions run 38833533987](https://github.com/FlareZ123/experiment-01/actions/runs/38833533987); its result should be checked rather than assumed.

## Limitations and next decisive experiment

A complete pinned Store fixture should show a Guzma & Hala play occurring from a legally reachable Aichi-style turn **with and without** the hook, under a fixed card state and controlled random streams, logging whether `PlayCardAction` was selected, attempted, and dispatched. Then compare policy-level full games and representative opponent tactics. The patch itself is a legality/policy fidelity correction, with **no demonstrated improvement in game wins**.

The pinned bot is also passed the full `State`, including hidden deck and hand card objects. Source-level access alone does not establish exploitation of hidden identities; an information-set invariance test is separately required before treating this or any other SimpleTacticsAi policy as competitively representative.
