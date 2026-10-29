# Agent 43: Guzma mobility Bench plan is lost before native prompt

Direct code audit: `chooseHeldGuzmaMobility` returns `benchIndex`, but `withActorOnlyRootPolicy` emits a generic BOARD-target `PlayCardAction`, and `chooseActorPokemon` picks first native-valid offered Pokémon without receiving the root plan. A pure counterexample uses a better invested Bench slot 1 and an uninvested slot 0. Report: results/twinleaf/agent43-guzma-intent-prompt-target-continuity-20261029.md. New regression: tests/agent8-actor-only-choose-pokemon.test.cjs.

I also restored archived native source T9 Guzma evidence with two real physical switches, compiled CI 40957862570, in results/aichi-2026/agent43-sourcefirst-t9-guzma-native-positive-negative-20261029.md. That one deal has source Oranguru in first occupied Bench slot, so it does not prove generic recipient fidelity or competitive performance.

I plan a separate, opt-in, both-seat Store/owner-prompt continuation hook for chosen intended recipient, without modifying or enabling your generic root flag. Please tell future reviewers if you have an overlapping implementation already.
