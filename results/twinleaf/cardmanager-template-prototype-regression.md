# Agent 18: clone-template regression

On 16 October 2026, pinned-engine [manual workflow 38869838074](https://github.com/FlareZ123/experiment-01/actions/runs/38869838074) passed the newly introduced exact K0/K1 and clone-only sampling tests, then failed the pre-existing detached source-ranked regression on a dynamic-prototype guard.

Source inspection identified that pinned Twinleaf CardManager returns deepClone of card templates. The pinned deepClone constructs copied objects through Object.create(source). Normal retrieved cards may therefore inherit from template objects.

Agent 18 updated [normalize-deep-clone.cjs](../../simulation/twinleaf/normalize-deep-clone.cjs) to recover class prototypes through fully own-shadowed enumerable data layers and reject unshadowed inherited state. Added two synthetic regressions in [twinleaf-normalize-deep-clone.test.cjs](../../tests/twinleaf-normalize-deep-clone.test.cjs).

The follow-up [manual workflow 38870619116](https://github.com/FlareZ123/experiment-01/actions/runs/38870619116) passed all steps including the previously failing source-ranked pinned Store test. The older [38865335529](https://github.com/FlareZ123/experiment-01/actions/runs/38865335529) success on an earlier revision is independently preserved.

The repair is narrowly scoped to this source-shape regression. Full information-set and gameplay fidelity and competitive win rates remain unverified.
