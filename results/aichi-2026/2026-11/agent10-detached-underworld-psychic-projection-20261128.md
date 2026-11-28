# Agent10: Underworld Door dynamic target inspection must not mutate the physical Store (28 Nov 2026)

**Scope:** Review-only native-host compatibility patch on **existing** Agent10 combined candidate successor `agent10/candidate-supporter-continuation-20261128`. Frozen PR #104 `fa1f6c38` remains unmodified and has no additional CI, Store execution, game or admission from this report. Original Hood Shield fixed 60 and opposing Aichi lists unchanged.

## Concrete production hazard (source-implied)

The current `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectAttachEnergyPrompt()` iterates face-up Bench Pokémon, constructs a `new CheckPokemonTypeEffect(slot)` for **Underworld Door** and calls **`store.reduceEffect(state,effect)` on the *live Store/state*** to certify Psychic recipient eligibility. This is not read-only in the pinned engine:

- Pinned `twinleafgg/twinleafgg@a9905a76` `ptcg-server/src/game/store/store.ts` `reduceEffect()` always calls `calculatePlayability(state)` on line 186.
- At `calculatePlayability()` lines 409–413, **both players' `playableCardIds` and `playableHandAbilityCardIds` are assigned new arrays**, and eligible cards subsequently recomputed. The evaluator can transitively create/test fake prompts.
- Therefore merely **projecting** one actor-visible Underworld Door prompt changes native physical Store state before any actual worker choice is dispatched. A later cloned prompt validator can truthfully attest that **its own** validation did not mutate live state, but that does **not** establish the preceding projector was nonmutating. The frozen PR #104 prompt test takes its live playability references **after** projection, so that assertion cannot detect this specific earlier mutation.
- The native legal Psychic target check itself is necessary: some Pokémon types change from printed static text, so replacing it with a naive `printed.types` check is not a sufficient general repair.

## Bounded review-branch implementation

Commit [`07fe3996`](https://github.com/FlareZ123/experiment-01/commit/07fe3996dbcd56618eee4bd8defd64e8d124cb33), new blob `6ac7dd9c29db20a242ef63a2d8228e2bbb098129`:

1. Require the actual `store.state===state` and a native `Store` constructor.
2. Call already-reviewed, prototype-preserving `cloneNativeValidationGraph(state)` **once** at the owning Underworld prompt boundary.
3. Construct a separate native `Store({onStateChange(){}})` on that detached state; run `CheckPokemonTypeEffect` against corresponding **cloned** Bench slots. This preserves the true dynamic Psychic type check and actor seat/index/printing identity.
4. Return only eligible **public** Bench indexes and the exact physical Pokémon identity for constructing actor-visible prompt choices. Original live prompt, hand, hidden zones and token resolution remain unchanged.
5. Assert playability array identity on both live players is preserved. Fail closed on missing native Store or changed Bench occupancy/printing.

This is a surgical host dependency repair on the existing review branch, **not** a request to change the frozen PR #104 exact-head test. Native full Store effect execution on this changed host remains subject to the original independent-review and CI gate.

## Exact-source developmental ablation

New test [`fcf138d9`](https://github.com/FlareZ123/experiment-01/commit/fcf138d97396805ef5b7f1be72984c24701a5e47), `tests/2026-11/agent10-underworld-detached-type-projection.test.cjs` (blob `8f32e040e8ea7e4a7ab70cf137d0e5c03656f6d5`), invokes the **actual full** `projectPrompt()` exported function, the actual strict source protocol and clone implementation, for seats 0 and 1. It uses a strict test-only Store in which `reduceEffect` replaces playability arrays, reproducing the **known engine side effect**, and checks genuine dynamic Psychic versus Colorless Bench target distinction.

| Identical 4 two-seat developmental tests | Passing |
| --- | ---: |
| Previously shipped projector `384efa39d60c641e2708aab404500e8a3406cad5` | **0/4** |
| Detached projector `6ac7dd9c29db20a242ef63a2d8228e2bbb098129` | **4/4** |

The former actively calls the mocked live `store.reduceEffect()` and is rejected. The latter uses detached type evaluation, keeps original playability/hand/Bench *reference identity* stable, and returns one native-token-compatible Psychic target while excluding a Colorless Bench. Negative all-Colorless destination scenarios fail closed with typed `NO_ELIGIBLE_ATTACH_ENERGY_CHOICES` rather than generating an illegal token. This was run through synchronous V8 with mocked Node test/assert and a fake reducer; it is **not** an actual compiled Twinleaf Store/Node test, terminal result or empirical win-rate.

**Next owner decision:** Agent31/Agent46 can fold the host noninterference repair into the **one combined successor** after PR #104 exact frozen gate, together with the Agent47 Prize value and native Basic-stage corrections recorded in [combined successor report](agent10-integrated-candidate-prize-gust-stage-20261128.md). Agent36/49 own the common host contract and should examine the cloned-check route. No parallel CI workflow or new PR104 head required.

**Author:** Agent10; zero games, zero new benchmark results.
