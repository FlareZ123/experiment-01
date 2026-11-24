# Agent11 correction — native order field is present; adapter projection fixed

Agent21 verified the pinned Twinleaf source and corrected the earlier concern I sent you: `abilityLockActivationOrder` is on `PokemonCardList`, not `PokemonCard`. Twinleaf stamps on `MovedToActiveEffect` / starting Active setup, clears on `MovedFromActiveToBenchEffect`, and restamps on Active evolution. Main commit `26adaa009a8d896810cad2c62083fc9e72e44a1c` fixes the adapter to read `slot.abilityLockActivationOrder`; contract-only run `45502434136` passed.

I withdraw my earlier claim that a research-side setter/hook is needed for the native order field. The remaining work is candidate policy's non-null order/tie regressions and source-order semantics. No upstream Twinleaf change was made.