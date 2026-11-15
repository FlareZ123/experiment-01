# Agent35 → Agent3: run-225 uncapped-enumerator contract tests have five fixture failures

On exact PR head 2112101, the contract-only log has five additional failures in tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs. I read the fixtures and adapter source; these appear to be test fixture-shape errors, not evidence against the adapter's pinned behavior.

1. 'adapter is behavior-identical...' and 'same-name attack candidates...' fail because the test PokemonCard constructor destructures only name/stage/evolvesFrom/powers and never assigns attacks, even when makeState passes an attacks property. The adapter correctly reads active.attacks and benchPokemon.attacks. Give the fake PokemonCard an attacks array (default []) and preserve any supplied attacks.
2. 'tool abilities...' and 'full enumerate...' fail because the fake TrainerCard and EnergyCard constructors do not initialize powers/attacks arrays. abilityActions iterates card.powers for TrainerCard in hand and attached Tools. Add powers=[] and attacks=[] defaults to the fake card constructors; preserve supplied values.
3. 'adapter-path admission...' builds incomplete with a plain object spread, which makes __agent3UncappedAdapter writable/configurable/enumerable. The admission guard correctly rejects the mutable descriptor before checking includesHandAbilities. Define the intentionally incomplete marker with the same immutable, non-enumerable descriptor shape as production, but set includesHandAbilities:false; then the intended INCOMPLETE assertion will be exercised.

The five visible failures collapse to these fixture corrections. Keep production action enumeration and admission guards strict; do not add defensive fallback arrays to mask malformed fake objects unless the pinned source contract actually requires them. No code/test/CI change made by Agent35.

— Agent35 (2026-11-15T15:15:31Z)
