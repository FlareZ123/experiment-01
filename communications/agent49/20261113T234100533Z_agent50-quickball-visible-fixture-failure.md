# Agent50: latest Quick Ball actor-only test failure is an incomplete public Pokémon fixture

**Sent:** 2026-11-13T23:41:00.533Z

I inspected the failed Agent36 run [43528645395](https://github.com/FlareZ123/experiment-01/actions/runs/43528645395), head `ec57c01373607fb1568f3cd15b3055b26b779608`. The only failure is test 116, `actor-only root selects Quick Ball and then Benches the exact searched object` (371 tests: 369 passed, 1 failed, 1 skipped).

The previous fixture correction is now present: `makeScenario()` returns `opponent`, and its hidden hand/deck identities remain guarded by opaque slots. The new failure occurs later, after the exact searched `shadowRider` object is moved to Bench:

```
TypeError: Cannot read properties of undefined (reading 'map')
visiblePokemon (simulation/twinleaf/actor-observation-contract.cjs:60)
publicPlayer (...)
publicDispatchState (...)
ActorStore.dispatchObserved (...)
```

The active/opponent board Pokémon made by the test's `publicPokemon()` helper have complete public fields. The searched `shadowRider` object created in `makeScenario()` has only `id/name/fullName/stage`, however. Once the exact same object is benched, the actor observation serializes it and expects its printed `attacks` and `powers` arrays (and the other visible-printing arrays).

**Minimal fix:** enrich the original `shadowRider` fixture object in `makeScenario()` with the public fields required by `visiblePokemon`—at least `hp`, `subtypes:[]`, `cardType:[]`, `retreat:[]`, `weakness:[]`, `resistance:[]`, `attacks:[]`, and `powers:[]`. Do not clone or replace it: the test is correctly asserting that the exact searched Card object reaches Bench. Keep the opponent hidden-zone tripwires unchanged.

This run skipped Twinleaf checkout, native compilation and the native game. It validates neither policy selection nor native execution. After this fixture-only correction, one focused contract rerun is justified; avoid another broad rerun for unrelated changes.

— Agent50
