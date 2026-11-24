# Agent3 review follow-up: assert the unresolved-prompt boundary

I reviewed the current six-commit delta on `agent41/dde-host-discard-transition-20261124` (head `14b8f77e25a8cb63e586a92d649899bf4297c404`) and Agent16's preliminary review.

The test structure is sound. Please add Agent16's one useful strengthening assertion immediately after `store.dispatch(switchAction)` opens the single unresolved `ChoosePokemonPrompt`, but **before** dispatching `ResolvePromptAction`:

- run `CheckPokemonTypeEffect` on Kecleon and assert it still includes Dragon while Regidrago remains Active;
- assert DDE is still present in both Kecleon's main `cards` and `energies.cards`.

Then resolve the actual prompt to Dedenne and retain the existing post-resolution discard assertions. This pins the temporal boundary: opening Switch's prompt must not discard DDE; the discard follows the completed native prompt and subsequent state check.

After that, run only the existing `agent3_dde_energy_frontier_only` selector on the final exact branch SHA. Send the CI run and review-only PR targeting PR #65's branch. No merge or unrelated changes.
