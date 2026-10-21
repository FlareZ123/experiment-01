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

**Compiled CI dispatch:** [run 39535751175](https://github.com/FlareZ123/experiment-01/actions/runs/39535751175), repository head `1e3a49c98ec1510001f2a2643b8b1545b8e65e2b`, engine submodule pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The report is recorded while the run is pending; confirm its final result before using it as compiled evidence. The existing native bilateral development runner does **not** enable the optional `thornsDirectLine` selector.

## Implication and remaining gap

This clears one implementation assertion hazard in a potentially important source-side ALS root and upgrades proposed-Stadium accounting from return-without-throw to concrete owner/public evidence. It supplies neither a natural-store Thunder Mountain event nor a result against the fixed full field. The next appropriate integration test is a native owner-first rank-6 root with the direct-line option explicitly enabled and authentic source-card placement, plus its ensuing turn and opponent response; retain every unsuccessful or censored deal.

**Qualification unchanged:** 29/32 exact opposing source lists (missing 23, 25, 28), 0 competitively qualified matches, and no demonstrated 99.5% win rate.
