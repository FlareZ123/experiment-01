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
- Its 32-bit seed is derived from SHA-256 of a versioned tuple containing only the search seed, iteration, physical acting seat and that actor's observation hash. It deliberately excludes search-internal ply: different hidden-world paths can reach the same actor information set at different depths.
- The policy callback no longer receives the mutable game-transition PRNG. Its random draws cannot shift subsequent game transitions.
- The transition PRNG remains the sole stream passed to `applyAction`.
- Added `opponentPolicyRngProtocol: "mcts-opponent-policy-rng-v1"` to the search audit when fixed opponent-policy mode is active; it is null when that mode is absent.

The per-information-set derivation is deliberate: a single per-iteration policy stream could still leak through a hidden-state-dependent number of earlier opponent-policy calls. The seed excludes the root observation and all concealed state.

Final core commit: `1ba4c8f26698c14c95e683c6929c738a073fdcf5`  
Core blob: `7576de4add7f18d20ad3f2485aa460cad1d01df1`

## Regression coverage

Extended the already-wired `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs` with two regressions:

1. Two root-private worlds produce the same opponent observation and legal frontier, while one root transition consumes an extra transition-RNG draw. The stochastic opponent receives the same first policy-RNG value and selects the same action in both worlds.
2. With the same root state and opponent information set, the policy consumes one versus three random draws. The next game-transition RNG value remains identical.

The three pre-existing strategy-fusion/frontier tests remain in the same file. The existing manual-only `.github/workflows/agent5-owner-root-native.yml` already includes this test file; no workflow or automatic trigger was added.

Final core-regression commit: `dc00c52df0ee639d064ae72c35e17a5f944a17bf`  
Test blob: `7b2f53191586f76f2330f7b4f2ce49b24dd9301e`  
Adapter-boundary regression commit: `8376b5c3f33b85ec90b2102ffad3c86e1de11459`

## Validation and limitations

- Executed the complete seven-test file in a V8 Code Mode harness against the fetched, committed core and test source: **7/7 passed**.
- The harness supplied deterministic SHA/assert shims because the environment did not provide Node's module loader. This validates the isolation behavior and regression logic, but is **not** a real Node 22 test run and does not validate cryptographic implementation details.
- No GitHub Actions workflow was dispatched; the available GitHub actions interface exposes workflow reads/logs/reruns but no `workflow_dispatch` operation.
- No native Twinleaf game, full-game MCTS policy, per-rank opponent competence evaluation, matchup result, paper-qualified game, or competitive win-rate evidence was produced.
- This fix does not solve root-determinization strategy fusion in legacy PUCT opponent nodes. For multi-ply field search, continue using frozen actor-observation opponent policies until a correct actor-relative re-determinization model is independently validated. The current Flittle provider remains a one-ply engineering fixture, not a strategic evaluation.

## Next actions

1. Run the existing Agent5 manual workflow on this exact main revision when an authorized workflow-dispatch path is available; require the real Node test lane to pass.
2. Keep policy RNG and transition RNG as separate interfaces in any future adapter/provider; reject regressions that pass one stream to both.
3. Before expanding MCTS depth, independently validate actor-relative information sets, legal-state consistency on return to the root, and seat-swap invariance.
4. Treat fixed opponent-policy mode as policy-conditioned search, not equilibrium modelling; qualify every per-rank opponent policy independently before field evaluation.


## Follow-up — timing context removed

The callback receives only the actor observation, sorted legal action keys, physical seat and isolated policy RNG. It receives no fifth context argument: no live clock, start/deadline timestamp, deadline checker, or redundant raw search seed. The core enforces the decision deadline before and after the callback. The audit records `opponentPolicyContextProtocol: "no-context-v1"`.

Core commit `1ba4c8f26698c14c95e683c6929c738a073fdcf5` (blob `7576de4add7f18d20ad3f2485aa460cad1d01df1`); no-context and internal-ply regression commit `dc00c52df0ee639d064ae72c35e17a5f944a17bf`; adapter-boundary regression commit `8376b5c3f33b85ec90b2102ffad3c86e1de11459`.

The seven-test file now includes a paired-world regression where the same opponent observation/frontier is reached after one versus two root actions. The policy RNG stream and selected action must remain identical. It also models hidden-state-dependent transition clock calls and asserts that the policy receives no context. The full seven-test file passed in the V8 deterministic SHA/assert-shim harness (**7/7**); native Node 22/CI and Twinleaf execution remain pending. The existing manual Agent5 workflow already includes the core regression file and adapter test file.


## Critical correction — internal search ply removed from policy seed

Agent43 and Critic identified a residual leak in the intermediate RNG fix: the seed included search-internal `ply`. The same opponent observation and legal frontier can be reached at different depths in different root-private worlds; the callback does not observe that internal depth, so including it let hidden path length change the stochastic action. Agent43 reproduced different true-SHA draws at ply 1 versus ply 2 for the same opponent information set.

The final implementation removes `ply` from the seed. The policy RNG is now keyed by the same information-set identity used by the core: search seed, iteration, physical seat and actor observation hash. The RNG protocol is version-bumped to `mcts-opponent-policy-rng-v2`. The fifth callback context argument was removed entirely (rather than exposing a deadline checker that could itself reveal hidden-state-dependent timing); the audit reports `opponentPolicyContextProtocol: "no-context-v1"`.

The new paired-world regression reaches the same opponent observation/frontier after one versus two root actions and asserts identical policy draws/actions. It passes with the full seven-test file in the V8 deterministic SHA/assert-shim harness. This is still not native Node/CI validation; use the existing manual Agent5 workflow before any stochastic fixed-policy qualification. This correction supersedes the earlier intermediate implementation that seeded on `ply` and passed deadline-only context.
