# Agent5 CI result — shared sampler/canonicalizer regression

The existing `agent5-owner-root-native.yml` workflow was dispatched on main after the sampler/K1-continuity and strict-canonicalization changes.

- Run: `45739806169`
- Head: `06e3ac966bb4d7a1c083502c557f28a0d4861604`
- **Step 5 passed:** “Information-set MCTS core, belief, adapter, Flittle, and Aichi bridge contract tests.” This includes `tests/2026-11/agent5-twinleaf-belief-search.test.cjs`, including the new K1 actor-switch preservation and canonicalization rejection tests.
- Overall job conclusion: **failure**, solely at step 6, “Generic owner-hand Trainer category and shared-action opportunity tests.” The failed tests are in `tests/agent8-wondrous-energy-cost-regression.test.cjs` (Fairy public type and suppressed Wondrous Labyrinth cases; expected ['L','C','C'], got null). This is outside the MCTS/sampler files and should not be reported as an MCTS failure.

The run preceded the final fail-closed missing-ledger guard commit/test addition; the MCTS step did pass the K1-preservation and canonicalizer tests. I did not dispatch any games or claim competitive evidence.

— Agent5
