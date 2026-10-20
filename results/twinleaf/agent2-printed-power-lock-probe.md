# Iron Thorns native Ability probe: printed-power parameter, not generic stub

**Agent 2, 20 October 2026 UTC.** Evidence: pinned Twinleaf source API inspection, a synthetic falsification case executed in V8, and six repository mocked-Store regressions evaluated in V8 after a two-file Git commit. This is not a compiled pinned-Store run or competitive game.

## Concrete issue and correction

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `IS_ABILITY_BLOCKED(store,state,player,card,power?)` in `ptcg-server/src/game/store/prefabs/prefabs.ts` accepts an optional specific `Power`. The helper builds a `PowerEffect` using that printed power's `powerType`, `exemptFromAbilityLock`, `exemptFromInitialize`, `knocksOutSelf`, `useFromHand`, and `useFromDiscard` properties. With no power argument, it instead builds a generic `PowerType.ABILITY` stub whose exemption fields are undefined.

The new rank-6 source-first observer `simulation/twinleaf/agent39-live-initialization-window.cjs` initially called the helper without the actual printed power. A synthetic eligible Rule-Box Pokémon with `powers:[{name:'Excluded',exemptFromInitialize:true}]` was incorrectly reported as blocked by a predicate obeying this exemption: generic-stub result `true`, printed-power-specific result `false`. This is an API-contract falsification example, not evidence that the actual Aichi candidate has that particular exempt printed power.

Commit [2f69922](https://github.com/FlareZ123/experiment-01/commit/2f69922ccd7ee01094ccbe84638d97fdb949fb46) changes that observer to select the eligible target's `powers[0]`, pass the actual object as the fifth argument to the pinned probe, and report `targetPowerName` alongside `targetNativeAbilityBlocked`. Its existing dependency-injected test now verifies exact power identity. One new synthetic exemption regression ensures a false blocked verdict is preserved.

## Tests and limits

The six tests in `tests/agent39-live-initialization-window.test.cjs` passed in the available V8 runtime using a mock of Node test and assertions and the existing fake Store. Both changed sources were reread from GitHub and dynamically compiled before the test run. **This is not a Node CLI pass and does not certify real pinned Twinleaf execution.** Request next that the canonical rank6 source-first arm be run once in the compiled original Store, under the existing manual workflow, without altering the bilateral decision policy.

The observer still chooses **the first** eligible Rule-Box card and its **first** printed power. Thus `targetNativeAbilityBlocked` is one printed-power observation, not proof all candidate abilities are suppressed, that another ability would have been strategically payable, or that Initialization alone caused a block. It is also not a Store-root-authenticated owner-paid attack. The global turn-1 rank6 early-pressure kind remains passive Initialization, distinct from a later Volt Cyclone attack. Agent39's broader evidence-class cautions continue to apply.

**Project status:** 29/32 exact opposing 60s, no qualified competitive games, no demonstrated 99.5% rate.
