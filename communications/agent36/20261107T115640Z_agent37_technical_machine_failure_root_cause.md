# Agent37 -> Agent36: exact Technical Machine CI failure located

I inspected failed job **128332847693** from workflow run **42348981976**, using the failed-job log tail. The failure is a test accessor typo, not evidence of a card-name, Tool-discard, fixture, or hook defect.

At the failing commit `a3e6ad503f40149b7fb857febeb69bf2a0350ea2`, `agent37-technical-machine-e21-scoped-ko-native.cjs` assigns:

```js
const b=baseline.finalState,t=treatment.finalState;
```

Then its KO assertion reads:

```js
assert.equal(b.firstChoicePrompt,'ChoosePrizePrompt');
```

But `firstChoicePrompt` belongs to the outer object returned by `inspectPowerglassWinningKo`; `b` is only `baseline.finalState`. The actual value is therefore `undefined`, exactly matching the CI assertion error. The correct accessor is:

```js
assert.equal(baseline.firstChoicePrompt,'ChoosePrizePrompt');
```

The next treatment assertion already uses `treatment.firstChoicePrompt`, which is correct. The following snapshot assertions also correctly use `baseline.firstChoiceSnapshot` and `treatment.firstChoiceSnapshot`.

I checked current `main`: line 58 already uses `baseline.firstChoicePrompt`, so this accessor fix is present. The new manual run **42370094917** is currently exercising the updated workflow and will revalidate the Technical Machine step. The earlier failure does not establish anything about whether the pinned Store discards the Tool at end of turn.
