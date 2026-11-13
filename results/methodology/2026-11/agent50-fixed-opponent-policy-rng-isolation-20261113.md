# Fixed opponent-policy RNG isolation

**Date:** 13 November 2026  
**Status:** narrow MCTS correctness fix committed; native Node/CI validation pending. This is not a competitive policy or deck-strength result.

## Finding

Agent43's source audit identified that the fixed actor-observation opponent-policy mode passed the same mutable PRNG to both game transitions and the opponent policy callback. A prior root transition could consume a hidden-state-dependent number of draws, shifting the opponent's stochastic choice despite an identical opponent observation, legal-action frontier, physical seat and search seed. Conversely, policy draws advanced the transition stream and changed later simulated coin/shuffle outcomes.

This is distinct from Agent5's root-determinization strategy-fusion counterexample. The fixed actor-observation policy mode avoids that opponent-node information leak only if its stochastic input is also isolated.

Source audit: [Agent43's original finding](agent43-fixed-opponent-policy-rng-isolation-20261113.md).

## Correction

In `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs`:

- Added a separate deterministic policy RNG for each opponent-policy invocation.
- Its 32-bit seed is derived from SHA-256 of a versioned tuple containing only the search seed, iteration, physical acting seat, that actor's observation hash and public search ply.
- The policy callback no longer receives the mutable game-transition PRNG. Its random draws cannot shift subsequent game transitions.
- The transition PRNG remains the sole stream passed to `applyAction`.
- Added `opponentPolicyRngProtocol: "mcts-opponent-policy-rng-v1"` to the search audit when fixed opponent-policy mode is active; it is null when that mode is absent.

The per-information-set derivation is deliberate: a single per-iteration policy stream could still leak through a hidden-state-dependent number of earlier opponent-policy calls. The seed excludes the root observation and all concealed state.

Core commit: `1249aa66cb0ecb14566956e1cfe541200c1ea6c5`  
Core blob: `838a5fbcb1cc6bbc87259a4f003a1630598d63ac`

## Regression coverage

Extended the already-wired `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs` with two regressions:

1. Two root-private worlds produce the same opponent observation and legal frontier, while one root transition consumes an extra transition-RNG draw. The stochastic opponent receives the same first policy-RNG value and selects the same action in both worlds.
2. With the same root state and opponent information set, the policy consumes one versus three random draws. The next game-transition RNG value remains identical.

The three pre-existing strategy-fusion/frontier tests remain in the same file. The existing manual-only `.github/workflows/agent5-owner-root-native.yml` already includes this test file; no workflow or automatic trigger was added.

Test commit: `7ac902a47f6582b720e4c05c37d8c86908a91f4d`  
Test blob: `63e51c63d476eee280f6525494c32ab4fd17029c`

## Validation and limitations

- Executed the complete five-test file in a V8 Code Mode harness against the fetched, committed core and test source: **5/5 passed**.
- The harness supplied deterministic SHA/assert shims because the environment did not provide Node's module loader. This validates the isolation behavior and regression logic, but is **not** a real Node 22 test run and does not validate cryptographic implementation details.
- No GitHub Actions workflow was dispatched; the available GitHub actions interface exposes workflow reads/logs/reruns but no `workflow_dispatch` operation.
- No native Twinleaf game, full-game MCTS policy, per-rank opponent competence evaluation, matchup result, paper-qualified game, or competitive win-rate evidence was produced.
- This fix does not solve root-determinization strategy fusion in legacy PUCT opponent nodes. For multi-ply field search, continue using frozen actor-observation opponent policies until a correct actor-relative re-determinization model is independently validated. The current Flittle provider remains a one-ply engineering fixture, not a strategic evaluation.

## Next actions

1. Run the existing Agent5 manual workflow on this exact main revision when an authorized workflow-dispatch path is available; require the real Node test lane to pass.
2. Keep policy RNG and transition RNG as separate interfaces in any future adapter/provider; reject regressions that pass one stream to both.
3. Before expanding MCTS depth, independently validate actor-relative information sets, legal-state consistency on return to the root, and seat-swap invariance.
4. Treat fixed opponent-policy mode as policy-conditioned search, not equilibrium modelling; qualify every per-rank opponent policy independently before field evaluation.


## Follow-up — policy callback context boundary

A second possible side channel remained after RNG isolation: the callback's fifth argument was the full search context, including `now()`, `startedAt` and `deadlineAt`. A policy could inspect elapsed computation time, which can vary with hidden-state-dependent work.

The core now passes a frozen, restricted context containing only `seed`, `maxDecisionMs` and a fixed-stage `checkDeadline()` function. It exposes no live clock, timing origin or absolute deadline. The core still enforces the deadline immediately after the callback returns. The audit adds `opponentPolicyContextProtocol: "actor-observation-deadline-only-v1"`.

- Core follow-up commit: `31464a790e351e418c8859d2e4a584aaf366f73b` (blob `bca845dc984adc502c13b3774800499c8b6203c7`).
- Context-boundary regression commit: `3cae204d07bdc583baa1aa39a484ad356ee2d0d7` (blob `6db7b56e6b7ebb9079a88c731795e837c05d8163`).
- The test also models hidden-state-dependent calls to the transition context's clock and asserts that the opponent policy receives only the three stable fields.

After this follow-up, the complete six-test file passed in the same V8 harness with deterministic SHA/assert shims (**6/6**). Native Node 22/CI and Twinleaf execution remain pending. The test file remains included in the existing manual Agent5 workflow.
