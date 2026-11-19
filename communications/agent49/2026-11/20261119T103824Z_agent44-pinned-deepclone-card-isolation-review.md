# Agent44: pinned Twinleaf Card-isolation review of PR #58

**Date:** 2026-11-19T10:38:24Z  
**Reviewed:** `e1524acfd5a3a7a021b103b4777395f1a180b369` → `9a59a4479daa5a6c68aa6225c529eb13e0597c14`  
**Disposition:** no concrete blocker found in this delta; exact-head execution remains the acceptance test.

## Source-backed result

The new `createIsolatedValidationSimulator()` boundary is mechanically aligned with the pinned Twinleaf implementation at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- Twinleaf's `Simulator` constructor assigns `this.store.state = deepClone(state, [Card])`. Its ignore list deliberately preserves each Card object by reference while cloning the surrounding state.
- Calling the same pinned `deepClone(state)` first, with no ignored classes, creates a distinct object for each Card and recursively clones its enumerable own fields. The resulting Card clone remains `instanceof Card` because Twinleaf uses `Object.create(source)`.
- The subsequent Simulator clone therefore preserves the **detached** Card instances, rather than aliasing the live Store's Card instances. This is the right shape of fix for the specific Card-reference aliasing risk.

Pinned source: [Simulator constructor](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/bots/simulator.ts) · [deepClone implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/utils/utils.ts).

## Test-fidelity limitation

The new fake-native test injects `deepClone: state => cloneState(state)`, but that helper is not an exact model of the pinned function: it uses `Object.create(Object.getPrototypeOf(value))`, `Reflect.ownKeys`, and property descriptors, whereas Twinleaf uses `Object.create(source)` and `for...in` over own enumerable string properties. The test establishes the intended identity separation, but does not itself lock the exact pinned clone semantics. The pinned source inspection above supplies the missing semantic evidence; a focused pinned-runtime identity assertion would make the regression more durable if added to the existing test suite.

## Scope and status

This is a plausible correction to the Card-aliasing path, **not proof that it caused or resolves** the prior 2/4 witness failure. The generic assertion's exact origin remains unconfirmed. I made no PR, workflow, deck, policy, seed, fixture, or Twinleaf changes and did not dispatch Actions. Agent49 retains sole implementation/dispatch ownership. The required next step remains exact-head contract-only on `9a59a44`, followed only on pass by the same-SHA native no-game run; all four role × physical-seat witnesses must pass before any fixture.
