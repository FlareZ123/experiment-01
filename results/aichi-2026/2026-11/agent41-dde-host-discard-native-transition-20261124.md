# DDE host-type-change discard: native transition regression

**Agent 41 · 24 November 2026 · pinned Twinleaf regression evidence**

## Question

When Double Dragon Energy is legally attached to Active Kecleon PLF 94 while the opponent's Active Pokémon is Dragon-type, does the pinned engine discard DDE after the opponent changes its Active to a non-Dragon Pokémon through a real game action and prompt resolution?

## Method

Added one regression to `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs`, reusing the existing `agent3_dde_energy_frontier_only` selector and `twinleaf-smoke.yml` workflow.

The test runs both physical seat orientations on Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. Build a native Simulator state with Kecleon PLF 94 Active opposite Regidrago V SIT.
2. Attach DDE to Kecleon through the native attachment action frontier; verify Kecleon resolves as Dragon and DDE is present in both host card and Energy lists.
3. End the Kecleon owner's turn through native `PassTurnAction`, resolving the actual silent `WaitPrompt` transitions.
4. Play `Switch BS` through native `PlayCardAction`; resolve its `Choose pokemon` prompt by moving Dedenne GX UNB (Lightning) Active.
5. After final prompt resolution, query Kecleon's type and inspect DDE's actual card locations.

No direct mutation of the host's type, no manually invoked DDE discard effect, no engine source patch, and no adapter hook are used in the transition.

## Result

<badge>PASS · both physical seats</badge>

In both orientations:

- Kecleon changes from Dragon to Lightning after the native Switch transition.
- DDE is moved into the Kecleon owner's discard pile by the post-prompt state check.
- DDE is absent from both the host's main card list and Energy list.

This exercises the native `CheckTableStateEffect` path after a completed top-level action and final prompt resolution. It turns the prior source-only trace into a passing regression for this concrete host/type-change sequence.

## Reproduction

- Test: `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs`
- Workflow: `twinleaf-smoke.yml`
- Selector: `agent3_dde_energy_frontier_only=true`
- Successful run: [45380972111](https://github.com/FlareZ123/experiment-01/actions/runs/45380972111)
- Successful job: `agent3-dde-energy-frontier`
- Review PR: [#67](https://github.com/FlareZ123/experiment-01/pull/67), based on PR #65's exact head and targeting its branch

## Scope and limitations

This validates one exact native transition in the pinned engine, in both physical seats. It does **not** prove every possible type-changing Ability/effect, every Stadium or Special Energy blocking interaction, or all timing paths. It is not a matchup simulation or evidence of competitive strength.

The Aichi source-list benchmark remains 29/32 exact original lists, with ranks 23, 25, and 28 missing; no competitive matchup is qualified by this test. The field-level relevance of DDE host type changes must still be interpreted against the authenticated source inventories and unresolved ranks.

**Disposition:** the concrete Kecleon/Regidrago-to-Dedenne host-discard transition is regression-qualified on the pinned Twinleaf revision, pending review of PR #67. Do not treat the broader Aichi engine-fidelity or deck-strength gates as automatically closed.
