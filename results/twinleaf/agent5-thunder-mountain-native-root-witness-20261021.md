# Iron Thorns Thunder Mountain root: missing public settlement witness repaired

**Agent 5 | 21 October 2026 | Development-only compatibility repair**

## Concrete failure path

The established owner-only canonical policy, `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, accepts an optional `thornsDirectLine` branch for an actor-visible Iron Thorns ex Active and a held Thunder Mountain Prism Star. It returns the typed intent `{kind:'play-thunder-mountain',handIndex,printing}`; the same module translates the intent into a native `PlayCardAction` against the board.

Its native dispatch-observation path imports `rootPhysicalSnapshot` and `rootPhysicalWitness` from `simulation/twinleaf/agent5-owner-root-slice.cjs`. Before this change, `rootPhysicalWitness` had no `play-thunder-mountain` case. The final `assert.equal(intent.kind,'attack')` was therefore reached for a Store dispatch that returned successfully, conflating a potentially legal Stadium root with an invalid attack-intent invariant. An actual native occurrence on the opt-in direct-line branch could abort audit execution even if the Store had accepted the action. This is a source-proven reachable branch; the pre-fix crash was **not** separately demonstrated in a naturally dealt native match.

## Narrow repair and falsification criterion

Commit [94cf637](../../simulation/twinleaf/agent5-owner-root-slice.cjs) extends the physical owner/public-zone snapshot with `stadiumPrintings`, sourced only from the acting player's publicly exposed Stadium list, without inspecting private deck, Prize or opponent-hand identities. The new `play-thunder-mountain` witness confirms a Store result only when:

- the intended printing was absent from the owner's Stadium list before dispatch;
- exactly one copy of that printing appears in the owner's Stadium list afterward;
- the acting owner's hand count decreases by one.

A no-op dispatch, a different Stadium, or another state without the required transition is **unconfirmed**, not counted as a successful setup. A public placement/witness is still an observation about this single root, not complete-game rules fidelity.

Unit tests in [Agent 5 native-root tests](../../tests/agent5-owner-root-slice.test.cjs) cover positive and negative public transition cases, and [canonical root-policy tests](../../tests/agent34-actor-only-root-policy.test.cjs) exercise the actual typed-intent selector for held Thunder Mountain. The snapshot fixture includes the new public field. The existing manual-only [Agent 5 native CI workflow](../../.github/workflows/agent5-owner-root-native.yml) now runs both suites ahead of pinned Twinleaf compilation.

**Compiled CI dispatch:** [run 39535751175](https://github.com/FlareZ123/experiment-01/actions/runs/39535751175), repository head `1e3a49c98ec1510001f2a2643b8b1545b8e65e2b`, engine submodule pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Final result: SUCCESS** (completed 2026-10-21 02:59:34 UTC). The workflow ran the new pure tests, compiled the pinned engine, and executed its existing historical native development checks. This verifies narrow checkout compatibility and does not exercise the opted-out direct-line Stadium branch in an authentic game. The existing native bilateral development runner does **not** enable the optional `thornsDirectLine` selector.

## Actual native Store validation

A second, dedicated test now exists in [`simulation/twinleaf/agent5-thunder-mountain-native-gate.cjs`](../../simulation/twinleaf/agent5-thunder-mountain-native-gate.cjs), hooked into the existing manual workflow. It constructs a controlled two-player native Store with the pinned **Iron Thorns ex TWM** and **Thunder Mountain Prism Star LOT** printing, resolves the actor-only `thornsDirectLine` selector, then actually dispatches `PlayCardAction` through the pinned reducer. The test asserts an originally absent Stadium enters the acting player's public Stadium zone, hand count decreases by one, the physical witness is `confirmed-public-effect`, and unchanged snapshots remain `no-confirmed-public-effect`. It repeats this check for **both physical owner seats 0 and 1**.

[Compiled native workflow run 39536361086](https://github.com/FlareZ123/experiment-01/actions/runs/39536361086) finished **SUCCESS** on 21 October 2026 at 03:04:48 UTC with checkout `d546927807ead52254d526debe8725e67cb32e1f`, engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow also completed its native Steven search gate. The specific new Store assertions for two staged seats passed because the native script is now a mandatory step.

## Implication and remaining gap

This clears a concrete typed-intent witness mismatch and proves the repaired path against a true Store transition with printed cards in both physical seats. The native positions were **constructed artificially**, so neither run demonstrates a naturally dealt rank-6 Thunder Mountain root, a complete Iron Thorns first-turn ALS, a legitimate opposing reply, a paper-clock result, or any game win. Next test should use the unchanged rank-6 source 60 and authentic physical deals, with the direct-line option enabled in a prespecified side-by-side policy comparison, retaining all failed and censored deals.

**Qualification unchanged:** 29/32 exact opposing source lists (missing 23, 25, 28), 0 competitively qualified matches, and no demonstrated 99.5% win rate.
