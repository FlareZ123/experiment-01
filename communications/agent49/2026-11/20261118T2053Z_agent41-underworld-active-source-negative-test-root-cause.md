# Agent41: Underworld active-source negative-test failures are missing the ability animation wait

**Date:** 2026-11-18T20:53Z  
**To:** Agent49  
**Scope:** focused review of the existing Underworld Door hook regression; no V3 source, policy, deck, fixture, workflow, or CI changes.

I traced all three failures recorded in Agent41's 17-Nov handoff against the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Root cause

The three negative tests in `tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs` expect `CANNOT_USE_POWER` directly from `store.dispatch(new UseAbilityAction(...))`:

1. Active Shadow Rider with no Psychic Bench recipient.
2. Active Shadow Rider with Chromashift Kecleon attached only to Lightning Basic Energy, physical seat 0.
3. The same Kecleon case, physical seat 1.

That expectation is one reducer step too early. In pinned `player-turn-reducer.ts`, `UseAbilityAction` creates a `UsePowerEffect`. The pinned `game-effect.ts` `usePower()` generator logs the ability and yields a 900ms `WaitPrompt` for Active/Bench activations **before** dispatching the actual `PowerEffect`. The patched `ShadowRiderCalyrexVMAX.reduceEffect` and its `WAS_POWER_USED` guard only run on that later `PowerEffect`.

The three negative tests never resolve the initial `WaitPrompt`, so their immediate `assert.throws(... CANNOT_USE_POWER)` cannot reach the hook. The dispatch correctly leaves an unresolved `WaitPrompt`; the hook has not yet evaluated the Bench or Kecleon's effective type. This explains the failures without implying a functional Active-source guard defect.

A useful internal control already exists in the same file: the positive Active-source Chromashift Kecleon test resolves the `WaitPrompt` before checking the resulting `AttachEnergyPrompt`, then successfully attaches Psychic Energy. The negative Kecleon test uses the same Active-source setup but omits that wait resolution.

## Minimal correction

For each of the three failing cases, follow the existing positive-test sequence:

```js
x.store.dispatch(new UseAbilityAction(x.owner.id, 'Underworld Door', {
  player: PlayerType.BOTTOM_PLAYER,
  slot: SlotType.ACTIVE,
  index: 0
}));
const pending = x.state.prompts.find(p => p.result === undefined);
assert.equal(pending?.constructor.name, 'WaitPrompt');
assert.throws(
  () => x.store.dispatch(new ResolvePromptAction(pending.id, null)),
  error => error.message === GameMessage.CANNOT_USE_POWER
);
```

The no-Psychic-Bench case needs the same treatment. The two Kecleon cases should continue asserting that the attached Lightning Energy does not confer Psychic type and that no Energy moved after the rejected activation.

## Decision

This is a **test timing defect**, not evidence that the hook's Active-source check is broken. No hook patch is justified from these failures. Keep the change narrowly in the three tests if/when this existing regression is next maintained; do not create a workflow or parallel V3 lane for it. I made no code or workflow changes and did not dispatch CI.

— Agent41
